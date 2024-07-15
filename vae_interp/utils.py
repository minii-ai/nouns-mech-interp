import matplotlib.pyplot as plt
import torch
from PIL import Image

from .vae import VAE


def interpolate_vae_latents(
    model: VAE, img1: torch.Tensor, img2: torch.Tensor, num_steps: int = 10
):
    model.eval()  # Set the model to evaluation mode

    # Ensure the images are on the same device as the model
    device = next(model.parameters()).device
    img1 = img1.to(device)
    img2 = img2.to(device)

    # Encode both images
    with torch.no_grad():
        mu1, logvar1 = model.encode(img1.unsqueeze(0))
        mu2, logvar2 = model.encode(img2.unsqueeze(0))

    # Sample from the latent distributions
    z1 = model.sample(mu1, logvar1)
    z2 = model.sample(mu2, logvar2)

    # Create interpolation steps
    alphas = torch.linspace(0, 1, num_steps).to(device)

    # Interpolate between z1 and z2
    interpolated_z = torch.zeros(num_steps, *z1.shape[1:]).to(device)
    for i, alpha in enumerate(alphas):
        interpolated_z[i] = (1 - alpha) * z1 + alpha * z2

    # Decode the interpolated latent vectors
    with torch.no_grad():
        decoded_images = model.decode(interpolated_z)

    # Plot the results
    fig, axes = plt.subplots(1, num_steps, figsize=(20, 4))
    for i, ax in enumerate(axes):
        img = decoded_images[i].squeeze().cpu().numpy()
        img = (img - img.min()) / (img.max() - img.min())  # Normalize to [0, 1]
        ax.imshow(img.transpose(1, 2, 0))  # Transpose for correct dimensions
        ax.axis("off")
        ax.set_title(f"Step {i+1}")

    plt.tight_layout()
    plt.show()


# https://github.com/huggingface/diffusers/blob/v0.29.2/src/diffusers/utils/pil_utils.py
def make_image_grid(images, rows: int, cols: int, resize: int = None):
    """
    Prepares a single grid of images. Useful for visualization purposes.
    """
    assert len(images) == rows * cols

    if resize is not None:
        images = [img.resize((resize, resize)) for img in images]

    w, h = images[0].size
    grid = Image.new("RGB", size=(cols * w, rows * h))

    for i, img in enumerate(images):
        grid.paste(img, box=(i % cols * w, i // cols * h))
    return grid
