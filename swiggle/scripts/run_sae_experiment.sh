#!/bin/bash

python run_sae_experiment.py \
    --in_features=64 \
    --expansion_factor=8 \
    --lr=2e-2,3e-2,5e-2 \
    --iterations=1000000 \
    --lambda_l1=1e-1,2e-1,1.5e-1 \
    --batch_size=2048 \
    --save_dir="../checkpoints/sae_gucci" \
    --checkpoint_every=5000 \
    --vae_embeddings_path="../data/vae_embeddings.npy" \
    --vae_checkpoint=../weights/vae \
    --concurrent_experiments=20 \
    --latent_shape=4,4,4 \
    --seed=0 \
    # --lambda_l1=5e-2,3e-2,1e-2 \
    # --save_dir="../checkpoints/sae_experiments_higher_l1" \
    # --batch_size=128 \
    # --batch_size=8192 \
