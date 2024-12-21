import modal
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

web_app = FastAPI()
app = modal.App("pentagram")

# Create a volume for image storage
volume = modal.Volume.from_name("image-storage")

class PromptRequest(BaseModel):
    prompt: str

@app.function(
    gpu="A10G",
    image=modal.Image.debian_slim().pip_install(
        "torch",
        "diffusers",
        "transformers",
        "accelerate"
    ),
    volumes={"/images": volume}
)
async def generate_image(prompt: str):
    import torch
    from diffusers import StableDiffusionPipeline
    
    model_id = "runwayml/stable-diffusion-v1-5"
    pipe = StableDiffusionPipeline.from_pretrained(
        model_id,
        torch_dtype=torch.float16,
    )
    pipe = pipe.to("cuda")
    
    image = pipe(prompt, num_inference_steps=50, guidance_scale=7.5).images[0]
    
    # Save image to volume
    image_path = f"/images/{hash(prompt)}.png"
    image.save(image_path, format="PNG")
    
    return {"imageUrl": f"https://pentagram.modal.run{image_path}"}

@app.route("/generate", methods=["POST"])
@web_app.post("/generate")
async def generate_endpoint(request: PromptRequest):
    try:
        result = await generate_image.remote(request.prompt)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    app.serve()