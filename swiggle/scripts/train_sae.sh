#!/bin/bash

python train_sae.py \
    --in_features=64 \
    --expansion_factor=16 \
    --lr=1e-4 \
    --iterations=250000 \
    --batch_size=4096 \
    --lambda_l1=1e-3 \
    --save_dir="../checkpoints/test2" \
    --checkpoint_every=500 \
    --vae_embeddings_path="../data/vae_embeddings.npy" \
    --vae_checkpoint=../weights/vae \
    --latent_shape=4,4,4 \
    --seed=32
    # --checkpoint_every=500 \
