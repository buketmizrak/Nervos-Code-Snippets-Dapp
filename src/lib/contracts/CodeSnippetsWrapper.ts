import Web3 from 'web3';
import * as CodeSnippetsJSON from '../../../build/contracts/CodeSnippets.json';
import { CodeSnippets } from '../../types/CodeSnippets';
import { CONTRACT_ADDRESS } from '../../ui/helpers';

const DEFAULT_SEND_OPTIONS = {
    gas: 6000000
};

export class CodeSnippetsWrapper {
    web3: Web3;

    contract: CodeSnippets;

    address: string;

    constructor(web3: Web3) {
        this.web3 = web3;
        this.address = CONTRACT_ADDRESS;
        this.contract = new web3.eth.Contract(CodeSnippetsJSON.abi as any) as any;
        this.contract.options.address = CONTRACT_ADDRESS;
    }

    get isDeployed() {
        return Boolean(this.address);
    }

    async getTotalCode(fromAddress: string) {
        const data = await this.contract.methods.totalCodes().call({ from: fromAddress });

        return parseInt(data, 10);
    }

    async getCode(id: number, fromAddress: string) {
        const code = await this.contract.methods.codes(id).call({ from: fromAddress });

        return { id: parseInt(code.id, 10), text: code.text };
    }

    async creteNewCode(code: string, fromAddress: string) {
        const tx = await this.contract.methods.createCodeSnippet(code).send({
            ...DEFAULT_SEND_OPTIONS,
            from: fromAddress
        });

        return tx;
    }
}
