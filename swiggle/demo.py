import torch
from models import SAE, VAE
from sentence_transformers import SentenceTransformer
from torchvision.transforms import ToPILImage

if __name__ == "__main__":
    sae = SAE.load_from_checkpoint("./weights/sae/config.json", "./weights/sae/sae.pth")
    vae = VAE.load_from_checkpoint("./weights/vae/config.json", "./weights/vae/vae.pth")

    model = SentenceTransformer("all-MiniLM-L6-v2")

    features = {
        2: "skateboard-shaped head",
        3: "treasure chest-shaped head",
        4: "shark-shaped head",
        27: "green and red/orange checkered shirt",
        28: "white, blue, pink, yellow shapes on graphic tee shirt",
    }

    inverse_features = {
        "skateboard-shaped head": 2,
        "treasure chest-shaped head": 3,
        "shark-shaped head": 4,
        "green and red/orange checkered shirt": 27,
        "white, blue, pink, yellow shapes on graphic tee shirt": 28,
    }

    idx = {
        "skateboard-shaped head": 0,
        "treasure chest-shaped head": 1,
        "shark-shaped head": 2,
        "green and red/orange checkered shirt": 3,
        "white, blue, pink, yellow shapes on graphic tee shirt": 4,
    }

    feature_descriptions = list(features.values())
    feature_embeddings = model.encode(feature_descriptions)

    # print(feature_embeddings.shape)

    activations = [5.25, 5.0, 5.0, 4.0, 2.0]

    while True:
        prompt = input("Enter your prompt: ")
        prompt_embedding = model.encode([prompt])

        # print(prompt_embedding.shape)

        # get top 2 embeddings, feature_embeddings is a tensor of shape (5, 384)
        top_k = 2
        distances = model.similarity(prompt_embedding, feature_embeddings)

        # get the idx of the top 2 features
        values, indices = torch.topk(distances, top_k)
        indices = indices.tolist()[0]

        selected_features = [feature_descriptions[idx] for idx in indices]
        feature_indices = [inverse_features[feature] for feature in selected_features]

        sparse_latent = torch.zeros((1, 512))
        sparse_latent[:, feature_indices[0]] = activations[idx[selected_features[0]]]
        sparse_latent[:, feature_indices[1]] = activations[idx[selected_features[1]]]

        with torch.no_grad():
            recon_latent = sae.decode(sparse_latent).view(-1, 4, 4, 4)
            recon_image = vae.decode(recon_latent).squeeze(0)

        recon_image = torch.clamp((recon_image + 1) * 0.5, 0, 1)

        # convert tensor to pil image and save
        to_image = ToPILImage()
        image = to_image(recon_image)

        image.save("./output.png")
