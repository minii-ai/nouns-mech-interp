import torch


def sae_loss(
    recon: torch.Tensor,
    latent: torch.Tensor,
    original: torch.Tensor,
    use_l1_loss: bool = True,
    l1_coeff: float = None,
) -> dict:
    assert l1_coeff is not None or not use_l1_loss

    recon_loss = (recon - original).pow(2).sum(-1).mean(0)

    if use_l1_loss:
        l1_loss = l1_coeff * latent.abs().sum(dim=1).mean()
    else:
        l1_loss = torch.tensor(0.0, device=recon.device)

    loss = recon_loss + l1_loss

    return {
        "loss": loss,
        "recon_loss": recon_loss.detach(),
        "l1_loss": l1_loss.detach(),
    }
