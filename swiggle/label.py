import argparse
import json
import os
import subprocess


def load_descriptions(folder):
    descriptions = {}
    for idx in sorted(os.listdir(folder), key=lambda x: int(x)):
        desc_file = os.path.join(folder, idx, "descriptions.txt")
        if os.path.exists(desc_file):
            with open(desc_file, "r") as file:
                descriptions[idx] = file.read()
    return descriptions


def load_image(folder, idx):
    img_path = os.path.join(folder, idx, "feature_topk_ablations.png")
    if os.path.exists(img_path):
        return img_path
    return None


def display_image(img_path):
    subprocess.run(["imgcat", img_path])


def save_progress(progress_file, idx):
    with open(progress_file, "w") as file:
        file.write(idx)


def load_progress(progress_file):
    if os.path.exists(progress_file):
        with open(progress_file, "r") as file:
            return file.read().strip()
    return None


def load_labels(output_file):
    if os.path.exists(output_file):
        with open(output_file, "r") as file:
            return json.load(file)
    return []


def load_skip_ids(skip_file):
    if os.path.exists(skip_file):
        with open(skip_file, "r") as file:
            return json.load(file)
    return []


def label_data(folder, skip_file, output_file, progress_file):
    descriptions = load_descriptions(folder)
    labels = load_labels(output_file)
    skip_ids = load_skip_ids(skip_file)
    last_idx = load_progress(progress_file)

    start_labeling = last_idx is None

    for idx in descriptions.keys():
        if int(idx) in skip_ids:
            continue
        if not start_labeling:
            if idx == last_idx:
                start_labeling = True
            continue

        img_path = load_image(folder, idx)
        if img_path:
            display_image(img_path)

        print(f"Description for {idx}: ")
        print(descriptions[idx])
        label = input("Enter label: ")
        score = int(input("Enter score: "))

        labels.append({"idx": idx, "label": label, "score": score})
        save_progress(progress_file, idx)

        with open(output_file, "w") as file:
            json.dump(labels, file, indent=4)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Labeling Tool")
    parser.add_argument(
        "--folder", help="Path to the folder containing labeled subfolders"
    )
    parser.add_argument(
        "--skip",
        required=True,
        help="Path to JSON file containing list of folder IDs to skip",
    )
    parser.add_argument("--output", default="labels.json", help="Output JSON file")
    args = parser.parse_args()

    progress_file = args.output + ".progress"
    label_data(args.folder, args.skip, args.output, progress_file)
