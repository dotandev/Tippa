/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/tipping.json`.
 */
export type Tipping = {
    "address": "EvheWnLFuVnpQcHfRZHJUPkPUKLcy1oHTYGJSVz4Zj6C",
    "metadata": {
      "name": "tipping",
      "version": "0.1.0",
      "spec": "0.1.0",
      "description": "Created with Anchor"
    },
    "instructions": [
      {
        "name": "claimCampaignFunds",
        "docs": [
          "Claim funds from a campaign"
        ],
        "discriminator": [
          242,
          170,
          98,
          231,
          46,
          25,
          156,
          102
        ],
        "accounts": [
          {
            "name": "creator",
            "writable": true,
            "signer": true
          },
          {
            "name": "campaign",
            "writable": true
          },
          {
            "name": "campaignVault",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    99,
                    97,
                    109,
                    112,
                    97,
                    105,
                    103,
                    110,
                    45,
                    118,
                    97,
                    117,
                    108,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "campaign"
                }
              ]
            }
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": []
      },
      {
        "name": "createCampaign",
        "docs": [
          "Create a new campaign"
        ],
        "discriminator": [
          111,
          131,
          187,
          98,
          160,
          193,
          114,
          244
        ],
        "accounts": [
          {
            "name": "creator",
            "writable": true,
            "signer": true
          },
          {
            "name": "campaign",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    99,
                    97,
                    109,
                    112,
                    97,
                    105,
                    103,
                    110
                  ]
                },
                {
                  "kind": "account",
                  "path": "creator"
                },
                {
                  "kind": "arg",
                  "path": "eventId"
                }
              ]
            }
          },
          {
            "name": "campaignVault",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    99,
                    97,
                    109,
                    112,
                    97,
                    105,
                    103,
                    110,
                    45,
                    118,
                    97,
                    117,
                    108,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "campaign"
                }
              ]
            }
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "goal",
            "type": "u64"
          },
          {
            "name": "eventId",
            "type": "string"
          },
          {
            "name": "platform",
            "type": "string"
          },
          {
            "name": "endTime",
            "type": "i64"
          }
        ]
      },
      {
        "name": "registerUser",
        "docs": [
          "Register a user profile with unique Tippa name"
        ],
        "discriminator": [
          2,
          241,
          150,
          223,
          99,
          214,
          116,
          97
        ],
        "accounts": [
          {
            "name": "owner",
            "writable": true,
            "signer": true
          },
          {
            "name": "userProfile",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    117,
                    115,
                    101,
                    114
                  ]
                },
                {
                  "kind": "arg",
                  "path": "tippaName"
                }
              ]
            }
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "tippaName",
            "type": "string"
          },
          {
            "name": "metadataUri",
            "type": "string"
          }
        ]
      },
      {
        "name": "sendCampaignTip",
        "docs": [
          "Send a tip to a campaign"
        ],
        "discriminator": [
          106,
          80,
          108,
          11,
          3,
          111,
          182,
          27
        ],
        "accounts": [
          {
            "name": "tipper",
            "writable": true,
            "signer": true
          },
          {
            "name": "campaign",
            "writable": true
          },
          {
            "name": "campaignVault",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    99,
                    97,
                    109,
                    112,
                    97,
                    105,
                    103,
                    110,
                    45,
                    118,
                    97,
                    117,
                    108,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "campaign"
                }
              ]
            }
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "memo",
            "type": "string"
          }
        ]
      },
      {
        "name": "sendSolTip",
        "docs": [
          "Send a tip using SOL (native lamports)"
        ],
        "discriminator": [
          87,
          59,
          189,
          185,
          62,
          123,
          158,
          126
        ],
        "accounts": [
          {
            "name": "tipper",
            "writable": true,
            "signer": true
          },
          {
            "name": "recipient",
            "writable": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "memo",
            "type": "string"
          },
          {
            "name": "contentId",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "userId",
            "type": {
              "option": "pubkey"
            }
          }
        ]
      },
      {
        "name": "sendSplTip",
        "docs": [
          "Send a tip using an SPL token"
        ],
        "discriminator": [
          96,
          134,
          207,
          1,
          31,
          152,
          61,
          215
        ],
        "accounts": [
          {
            "name": "tipper",
            "writable": true,
            "signer": true
          },
          {
            "name": "recipient"
          },
          {
            "name": "fromTokenAccount",
            "writable": true
          },
          {
            "name": "toTokenAccount",
            "writable": true
          },
          {
            "name": "tokenMint"
          },
          {
            "name": "tokenProgram",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "memo",
            "type": "string"
          },
          {
            "name": "contentId",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "userId",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "eventId",
            "type": {
              "option": "string"
            }
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "campaign",
        "discriminator": [
          50,
          40,
          49,
          11,
          157,
          220,
          229,
          192
        ]
      },
      {
        "name": "userProfile",
        "discriminator": [
          32,
          37,
          119,
          205,
          179,
          180,
          13,
          194
        ]
      }
    ],
    "events": [
      {
        "name": "tipEvent",
        "discriminator": [
          213,
          36,
          191,
          50,
          28,
          25,
          189,
          252
        ]
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "unauthorized",
        "msg": "Unauthorized action"
      },
      {
        "code": 6001,
        "name": "invalidName",
        "msg": "Invalid name format"
      }
    ],
    "types": [
      {
        "name": "campaign",
        "docs": [
          "Campaign Account"
        ],
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "creator",
              "type": "pubkey"
            },
            {
              "name": "title",
              "type": "string"
            },
            {
              "name": "description",
              "type": "string"
            },
            {
              "name": "goal",
              "type": "u64"
            },
            {
              "name": "currentTotal",
              "type": "u64"
            },
            {
              "name": "eventId",
              "type": "string"
            },
            {
              "name": "platform",
              "type": "string"
            },
            {
              "name": "isActive",
              "type": "bool"
            },
            {
              "name": "startTime",
              "type": "i64"
            },
            {
              "name": "endTime",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "tipEvent",
        "docs": [
          "Event emitted after any tip"
        ],
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "tipper",
              "type": "pubkey"
            },
            {
              "name": "recipient",
              "type": "pubkey"
            },
            {
              "name": "amount",
              "type": "u64"
            },
            {
              "name": "tokenMint",
              "type": {
                "option": "pubkey"
              }
            },
            {
              "name": "memo",
              "type": "string"
            },
            {
              "name": "contentId",
              "type": {
                "option": "pubkey"
              }
            },
            {
              "name": "userId",
              "type": {
                "option": "pubkey"
              }
            },
            {
              "name": "timestamp",
              "type": "i64"
            },
            {
              "name": "eventId",
              "type": {
                "option": "string"
              }
            }
          ]
        }
      },
      {
        "name": "userProfile",
        "docs": [
          "User Profile Account"
        ],
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "owner",
              "type": "pubkey"
            },
            {
              "name": "tippaName",
              "type": "string"
            },
            {
              "name": "metadataUri",
              "type": "string"
            },
            {
              "name": "creationTime",
              "type": "i64"
            }
          ]
        }
      }
    ]
  };
  