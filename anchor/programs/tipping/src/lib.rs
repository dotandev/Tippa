use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("Gtq8jJ9vaJEQNLmTUqpyceyedCRRFJSBWdk16YLGSPkZ");

#[program]
pub mod tipping {
    use super::*;

    pub fn send_sol_tip(
        ctx: Context<SendSolTip>,
        amount: u64,
        memo: String,
        content_id: Option<Pubkey>,
        user_id: Option<Pubkey>,
    ) -> Result<()> {
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.tipper.key(),
            &ctx.accounts.recipient.key(),
            amount,
        );
        
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.tipper.to_account_info(),
                ctx.accounts.recipient.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        emit!(TipEvent {
            tipper: ctx.accounts.tipper.key(),
            recipient: ctx.accounts.recipient.key(),
            amount,
            token_mint: None,
            memo,
            content_id,
            user_id,
            timestamp: Clock::get()?.unix_timestamp,
            event_id: None,
        });

        Ok(())
    }

    pub fn send_spl_tip(
        ctx: Context<SendSplTip>,
        amount: u64,
        memo: String,
        content_id: Option<Pubkey>,
        user_id: Option<Pubkey>,
        event_id: Option<String>,
    ) -> Result<()> {
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.from_token_account.to_account_info(),
                    to: ctx.accounts.to_token_account.to_account_info(),
                    authority: ctx.accounts.tipper.to_account_info(),
                },
            ),
            amount,
        )?;

        emit!(TipEvent {
            tipper: ctx.accounts.tipper.key(),
            recipient: ctx.accounts.recipient.key(),
            amount,
            token_mint: Some(ctx.accounts.token_mint.key()),
            memo,
            content_id,
            user_id,
            timestamp: Clock::get()?.unix_timestamp,
            event_id,
        });

        Ok(())
    }

    pub fn create_campaign(
        ctx: Context<CreateCampaign>,
        title: String,
        description: String,
        goal: u64,
        event_id: String,
        platform: String,
        end_time: i64,
    ) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        campaign.creator = ctx.accounts.creator.key();
        campaign.title = title;
        campaign.description = description;
        campaign.goal = goal;
        campaign.current_total = 0;
        campaign.event_id = event_id;
        campaign.platform = platform;
        campaign.is_active = true;
        campaign.start_time = Clock::get()?.unix_timestamp;
        campaign.end_time = end_time;

        Ok(())
    }

    pub fn send_campaign_tip(
        ctx: Context<SendCampaignTip>,
        amount: u64,
        memo: String,
    ) -> Result<()> {
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.tipper.key(),
            &ctx.accounts.campaign_vault.key(),
            amount,
        );
        
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.tipper.to_account_info(),
                ctx.accounts.campaign_vault.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        ctx.accounts.campaign.current_total += amount;

        emit!(TipEvent {
            tipper: ctx.accounts.tipper.key(),
            recipient: ctx.accounts.campaign.creator,
            amount,
            token_mint: None,
            memo,
            content_id: None,
            user_id: None,
            timestamp: Clock::get()?.unix_timestamp,
            event_id: Some(ctx.accounts.campaign.event_id.clone()),
        });

        Ok(())
    }

    pub fn claim_campaign_funds(ctx: Context<ClaimCampaignFunds>) -> Result<()> {
        require!(
            ctx.accounts.campaign.creator == ctx.accounts.creator.key(),
            TippingError::Unauthorized
        );

        let amount = ctx.accounts.campaign_vault.lamports();
        **ctx.accounts.campaign_vault.try_borrow_mut_lamports()? = 0;
        **ctx.accounts.creator.try_borrow_mut_lamports()? += amount;

        ctx.accounts.campaign.is_active = false;

        Ok(())
    }

    pub fn register_user(
        ctx: Context<RegisterUser>, 
        tippa_name: String, 
        metadata_uri: String
    ) -> Result<()> {
        require!(tippa_name.len() >= 3 && tippa_name.len() <= 32, TippingError::InvalidName);
        
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.owner = ctx.accounts.owner.key();
        user_profile.tippa_name = tippa_name;
        user_profile.metadata_uri = metadata_uri;
        user_profile.creation_time = Clock::get()?.unix_timestamp;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct SendSolTip<'info> {
    #[account(mut)]
    pub tipper: Signer<'info>,
    
    #[account(mut)]
    pub recipient: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SendSplTip<'info> {
    #[account(mut)]
    pub tipper: Signer<'info>,
    
    pub recipient: AccountInfo<'info>,
    
    #[account(
        mut,
        constraint = from_token_account.owner == tipper.key(),
        constraint = from_token_account.mint == token_mint.key()
    )]
    pub from_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = to_token_account.mint == token_mint.key()
    )]
    pub to_token_account: Account<'info, TokenAccount>,
    
    pub token_mint: Account<'info, Mint>,
    
    pub token_program: Program<'info, Token>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String, description: String, goal: u64, event_id: String)]
pub struct CreateCampaign<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(
        init,
        payer = creator,
        space = 8 + 32 + 100 + 200 + 8 + 8 + 50 + 50 + 1 + 8 + 8,
        seeds = [b"campaign", creator.key().as_ref(), event_id.as_bytes()],
        bump
    )]
    pub campaign: Account<'info, Campaign>,
    
    #[account(
        seeds = [b"campaign-vault", campaign.key().as_ref()],
        bump
    )]
    pub campaign_vault: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SendCampaignTip<'info> {
    #[account(mut)]
    pub tipper: Signer<'info>,
    
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    
    #[account(
        mut,
        seeds = [b"campaign-vault", campaign.key().as_ref()],
        bump
    )]
    pub campaign_vault: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimCampaignFunds<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(
        mut,
        constraint = campaign.creator == creator.key(),
        constraint = campaign.is_active == true
    )]
    pub campaign: Account<'info, Campaign>,
    
    #[account(
        mut,
        seeds = [b"campaign-vault", campaign.key().as_ref()],
        bump
    )]
    pub campaign_vault: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(tippa_name: String)]
pub struct RegisterUser<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 32 + 200 + 8,
        seeds = [b"user", tippa_name.as_bytes()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Campaign {
    pub creator: Pubkey,
    pub title: String,
    pub description: String,
    pub goal: u64,
    pub current_total: u64,
    pub event_id: String,
    pub platform: String,
    pub is_active: bool,
    pub start_time: i64,
    pub end_time: i64,
}

#[account]
pub struct UserProfile {
    pub owner: Pubkey,
    pub tippa_name: String,
    pub metadata_uri: String,
    pub creation_time: i64,
}

#[event]
pub struct TipEvent {
    pub tipper: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub token_mint: Option<Pubkey>,
    pub memo: String,
    pub content_id: Option<Pubkey>,
    pub user_id: Option<Pubkey>,
    pub timestamp: i64,
    pub event_id: Option<String>,
}

#[error_code]
pub enum TippingError {
    #[msg("Unauthorized action")]
    Unauthorized,
    #[msg("Invalid name format")]
    InvalidName,
}
