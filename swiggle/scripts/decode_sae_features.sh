#!/bin/bash

python3 decode_sae_features.py \
    --latent_shape="4,4,4" \
    --vae_checkpoint=../weights/vae \
    --vae_embeddings=../data/vae_embeddings.npy \
    --output_dir=../data/sae_decoded_features \
    --sae_checkpoint="../checkpoints/eric/lr=1.0e-03_l1=4.0e-02" \
    # --sae_checkpoint="../checkpoints/topk/lr=5.0e-05_k=15" \
    # --sae_checkpoint="../checkpoints/sae_awesome/lr=5.0e-03_l1=1.0e-02" \
    # --sae_checkpoint="../checkpoints/sae_massive/lr=1.0e-02_l1=1.0e-03" \
    # --sae_checkpoint="../checkpoints/sae_good/lr=1.0e-02_l1=1.0e-02" \
    # --sae_checkpoint="../checkpoints/sae_l1/lr=8.0e-03_l1=4.0e-02" \
    # --sae_checkpoint="../checkpoints/sae_l1/lr=8.0e-03_l1=4.0e-02" \
    # --sae_checkpoint="../checkpoints/sae_l1/lr=8.0e-03_l1=4.0e-02" \
    # --sae_checkpoint="../checkpoints/sae_l1/lr=3.0e-03_l1=8.0e-02" \
    # --sae_checkpoint="../checkpoints/sae_experiments_improved_l1/lr=5.0e-04_l1=1.0e-03" \
    # --sae_checkpoint="../checkpoints/sae_experiments_higher_l1/lr=1.0e-04_l1=3.0e-02" \
    # --sae_checkpoint="../checkpoints/sae_experiments_big_batch/lr=1.0e-04_l1=3.0e-03" \
    # --sae_checkpoint="../checkpoints/sae_experiments/lr=5.0e-04_l1=5.0e-03" \
    # --vae_checkpoint=../checkpoints/vae \
    # --sae_checkpoint="../checkpoints/sae_experiments_smaller_batch/lr=5.0e-05_l1=5.0e-03" \
    # --sae_checkpoint="../checkpoints/sae_experiments/lr=5.0e-04_l1=5.0e-03" \
    # --sae_checkpoint="../checkpoints/sae_experiments2/lr=5.0e-04_l1=1.0e-03" \