#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("FqzkXZdwYjurnUKetJCAvaUw5WAqbwzU6gZEwydeEfqS");

#[program]
pub mod snovi {
    use super::*;

    pub fn close(_ctx: Context<CloseSnovi>) -> Result<()> {
        Ok(())
    }

    pub fn decrement(ctx: Context<Update>) -> Result<()> {
        ctx.accounts.snovi.count = ctx.accounts.snovi.count.checked_sub(1).unwrap();
        Ok(())
    }

    pub fn increment(ctx: Context<Update>) -> Result<()> {
        ctx.accounts.snovi.count = ctx.accounts.snovi.count.checked_add(1).unwrap();
        Ok(())
    }

    pub fn initialize(_ctx: Context<InitializeSnovi>) -> Result<()> {
        Ok(())
    }

    pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
        ctx.accounts.snovi.count = value.clone();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeSnovi<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
  init,
  space = 8 + snovi::INIT_SPACE,
  payer = payer
    )]
    pub snovi: Account<'info, Snovi>,
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseSnovi<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
  mut,
  close = payer, // close account and return lamports to payer
    )]
    pub snovi: Account<'info, Snovi>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub snovi: Account<'info, Snovi>,
}

#[account]
#[derive(InitSpace)]
pub struct Snovi {
    count: u8,
}
