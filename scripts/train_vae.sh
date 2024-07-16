#!/bin/bash

python train_vae.py \
    --num_hiddens=32,64,128,256 \
    --latent_dim=4 \
    --lr=1e-3 \
    --iterations=500000 \
    --batch_size=32 \
    --max_beta=0.000001 \
    --save_dir="../checkpoints/vae_new_mse" \
    --checkpoint_every=2500 \