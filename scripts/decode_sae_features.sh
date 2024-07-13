#!/bin/bash

python3 decode_sae_features.py \
    --vae_checkpoint=../checkpoints/vae \
    --sae_checkpoint="../checkpoints/sae_experiments2/lr=1.0e-04_l1=5.0e-03" \
    --vae_embeddings=../vae_embeddings.npy \
    --output_dir=./results/sae_decoded_features