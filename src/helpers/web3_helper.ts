import { BehaviorSubject } from "rxjs";
import Web3 from "web3";

import WVWPreSale from "../contracts/WVWPreSale.json";
import WVWToken from "../contracts/WVWToken.json";

export interface Web3Object {
  web3: Web3;
  accounts: Array<string>;
  connected: boolean;
}

export interface IWVWPreSale {
  methods: {
    buyTokens(amount: number): any;
    getSpentValue(address: string): any;
    getTokenPrice(): any;
  };
}

export class Web3Helper {
  private static _instance: Web3Helper;

  // private readonly NETWORK_GOERLI = "5";
  // private readonly LOCAL_NETWORK = "666";
  private readonly CURRENT_NETWORK = "666";

  private web3: Web3 = new Web3();
  private accounts: Array<string> = [];
  private connected = false;

  public web3Objects = new BehaviorSubject<Web3Object>({
    web3: new Web3(),
    accounts: [],
    connected: false,
  });

  private constructor() { }

  public static get Instance() {
    return this._instance || (this._instance = new Web3Helper());
  }

  public async init(provider: any) {
    if (provider) {
      // if (provider.chainId !== this.NETWORK_GOERLI) {
      //   await provider.request({
      //     method: "wallet_switchEthereumChain",
      //     params: [{ chainId: this.NETWORK_GOERLI_HEX }],
      //   });
      // }
      await provider.request({ method: "eth_requestAccounts" });
      this.listeningAccountChange(provider);
      this.listeningNetworkChange(provider);
      await this.setContext(provider);
    } else {
      throw Error("Provider is undefined");
    }
  }

  public get getTokenAddress(): string {
    return WVWToken.networks[this.CURRENT_NETWORK].address;
  }

  public get getPreSaleAddress(): string {
    return WVWPreSale.networks[this.CURRENT_NETWORK].address;
  }

  public getPreSaleInstance(): IWVWPreSale {
    if (this.web3) {
      return new this.web3.eth.Contract(
        WVWPreSale.abi as any,
        (WVWPreSale.networks[this.CURRENT_NETWORK]).address
      );
    } else {
      throw Error("web3Confg isnt Initialized.");
    }
  }

  public disconnect(): void {
    this.web3 = new Web3();
    this.accounts = [];
    this.connected = false;
    this.web3Objects.next({
      web3: this.web3,
      accounts: this.accounts,
      connected: this.connected,
    });
  }

  private async setContext(provider: any) {
    this.web3 = new Web3(provider);
    this.accounts = await this.web3.eth.getAccounts();
    this.connected = true;

    this.web3Objects.next({
      web3: this.web3,
      accounts: this.accounts,
      connected: this.connected,
    });
  }

  private listeningAccountChange(provider: any): void {
    provider.on("accountsChanged", (accounts: Array<string>) => {
      this.accounts = accounts;
      this.web3Objects.next({
        web3: this.web3,
        accounts: this.accounts,
        connected: this.connected,
      });
    });
  }

  private listeningNetworkChange(provider: any): void {
    provider.on("chainChanged", (chainId: number) => {
      window.location.reload();
    });
  }
}
