#!/bin/bash

python3 prepare_interpretability_dataset.py \
    --sae_checkpoint="../checkpoints/sae_experiments2/lr=5.0e-04_l1=1.0e-03" \
    --vae_checkpoint="../checkpoints/vae" \
    --output_dir="../data/interp_dataset" \
    --decoded_features_dir="../data/sae_decoded_features" \
    --vae_embeddings_path="../vae_embeddings.npy" \
    --k=9 \
