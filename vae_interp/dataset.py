import numpy as np
import torch
from datasets import load_dataset
from torch.utils.data import DataLoader, Dataset
from torchvision.transforms import v2


def load_nouns_dataset(image_size: int, normalize: bool = True):
    # Define the transform pipeline
    transform = [
        v2.Resize((image_size, image_size)),
        v2.ToImage(),
        v2.ToDtype(torch.float32, scale=True),
    ]

    if normalize:
        transform.append(v2.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5)))

    transform = v2.Compose(transform)

    # Create and return the dataset
    return NounsDataset(transform)


class NounsDataset(Dataset):
    def __init__(self, transform=None):
        super().__init__()
        self.dataset = load_dataset("m1guelpf/nouns", split="train")
        self.transform = transform

    def __len__(self):
        return len(self.dataset)

    def __getitem__(self, idx):
        image = self.dataset[idx]["image"]
        if self.transform:
            image = self.transform(image)

        return image


class NpyDataset(Dataset):
    def __init__(self, npy_path: str):
        super().__init__()

        data = np.load(npy_path)
        data = torch.from_numpy(data).to(torch.float32)
        self.data = data

    def __len__(self):
        return self.data.shape[0]

    def __getitem__(self, idx):
        return self.data[idx]
