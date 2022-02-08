//claim nft+transfer nft
import { TransactionRequest } from "@ethersproject/abstract-provider";
import { Base } from "./Base";
import { isAddress, parseUnits } from "ethers/lib/utils";
import { Contract, providers } from "ethers";




const ERC20_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
					"internalType": "bool",
					"name": "",
					"type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

const cmbCLAIM_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "nounce",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]






export class CMB extends Base {
  private _recipient: string
  private _cmbClaimContract: Contract;
  private _cmbERC20Contract: Contract;
  private _sender: string;


  
  constructor(provider: providers.JsonRpcProvider, sender: string, recipient: string, _cmbTokenAddress: string) {
    super()
    if (!isAddress(recipient)) throw new Error("Bad recipient Address")
    if (!isAddress(sender)) throw new Error("Bad sender Address")
    this._sender = sender;
    this._recipient = recipient;
    this._cmbClaimContract = new Contract(_cmbTokenAddress, cmbCLAIM_ABI, provider);
    this._cmbERC20Contract = new Contract(_cmbTokenAddress, ERC20_ABI, provider);
  }

  async description(): Promise<string> {
    return `claim cmb from ${this._sender}, and transfer to ${this._recipient}`
  }

  async getSponsoredTransactions(): Promise<Array<TransactionRequest>> {
    // you can open broswer to https://api.theopendao.com/api/opendao/claim/[Fill Your Address] 
    // get total_share, v, r, s and fill below
    //
    // such as for my address https://api.theopendao.com/api/opendao/claim/0x49E53Fb3d5bf1532fEBAD88a1979E33A94844d1d
    // const total_share = "41429244.5055"
    // const v = "12664759760331458874453076485325239921451404572804478121060178750865498554368"
    // const r = "0xe57fcd80afe2701a3469c0411080595ee77a8315481589b0494981f06b6e7cdd"
    // const s = "0x7a716d2e99812e791fd17afcbffe92c1980e25f68ea2519ec21d845ed672a7e8"

    
    const amount = "13000"
    const nounce = "1"
    const signature = "0xefd000836a1e79ec6d9382f6e4c22087cb6a8c67f8eccdc9e57cfe4db058d1b308bf2ffaae3df011156ed7c0f7623b2e4b00799aaddb2c52ae42771b524f7b731c"


    return [
      { ...await this._cmbClaimContract.populateTransaction.mint(this._sender, amount, nounce, signature), gasLimit: 60000 },
      { ...await this._cmbERC20Contract.populateTransaction.transferFrom(this._sender, this._recipient, amount), gasLimit: 100000 }
    ]
  }
}
