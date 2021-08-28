/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { ToastContainer, toast } from 'react-toastify';
import './app.scss';
import 'react-toastify/dist/ReactToastify.css';
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import { AddressTranslator } from 'nervos-godwoken-integration';

import { CodeSnippetsWrapper } from '../lib/contracts/CodeSnippetsWrapper';
import { CONFIG } from '../config';
import { CONTRACT_ADDRESS, DEPLOY_HASH } from './helpers';
import ShowCodeSnippet from './components/ShowCodeSnippet';

type ICode = { text: string; id: number };
async function createWeb3() {
    // Modern dapp browsers...
    if ((window as any).ethereum) {
        const godwokenRpcUrl = CONFIG.WEB3_PROVIDER_URL;
        const providerConfig = {
            rollupTypeHash: CONFIG.ROLLUP_TYPE_HASH,
            ethAccountLockCodeHash: CONFIG.ETH_ACCOUNT_LOCK_CODE_HASH,
            web3Url: godwokenRpcUrl
        };

        const provider = new PolyjuiceHttpProvider(godwokenRpcUrl, providerConfig);
        const web3 = new Web3(provider || Web3.givenProvider);

        try {
            // Request account access if needed
            await (window as any).ethereum.enable();
        } catch (error) {
            // User denied account access...
        }

        return web3;
    }

    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    return null;
}

export function App() {
    const [web3, setWeb3] = useState<Web3>(null);
    const [contract, setContract] = useState<CodeSnippetsWrapper>();
    const [accounts, setAccounts] = useState<string[]>();
    const [l2Balance, setL2Balance] = useState<bigint>();

    const [polyjuiceAddress, setPolyjuiceAddress] = useState<string | undefined>();
    const [transactionInProgress, setTransactionInProgress] = useState(false);
    const toastId = React.useRef(null);

    const [snippet, setSnippet] = useState<string>();
    const [codes, setCodes] = useState<ICode[]>();

    useEffect(() => {
        if (accounts?.[0]) {
            const addressTranslator = new AddressTranslator();
            setPolyjuiceAddress(addressTranslator.ethAddressToGodwokenShortAddress(accounts?.[0]));
        } else {
            setPolyjuiceAddress(undefined);
        }
    }, [accounts?.[0]]);

    useEffect(() => {
        if ((accounts?.[0], contract)) getCodes();
    }, [accounts, contract]);

    useEffect(() => {
        if (transactionInProgress && !toastId.current) {
            toastId.current = toast.info(
                'Transaction in progress. Confirm MetaMask signing dialog and please wait...',
                {
                    position: 'top-right',
                    autoClose: false,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    closeButton: false
                }
            );
        } else if (!transactionInProgress && toastId.current) {
            toast.dismiss(toastId.current);
            toastId.current = null;
        }
    }, [transactionInProgress, toastId.current]);

    const account = accounts?.[0];

    async function getCodes() {
        setCodes(undefined);
        const uploadedCodeSize = await contract.getTotalCode(account);

        const contractCodes = [];
        for (let codeId = 1; codeId <= uploadedCodeSize; codeId++) {
            const code = await contract.getCode(codeId, account);
            contractCodes.push(code);
        }
        setCodes(contractCodes);
        toast('Successfully read all code snippets.', { type: 'success' });
    }

    async function createNewCodeSnippet() {
        if (!snippet) return;
        try {
            setTransactionInProgress(true);
            await contract.creteNewCode(snippet, account);
            toast(
                'Successfully set latest stored value. You can refresh the read value now manually.',
                { type: 'success' }
            );
            await getCodes();
        } catch (error) {
            console.error(error);
            toast.error(
                'There was an error sending your transaction. Please check developer console.'
            );
        } finally {
            setTransactionInProgress(false);
        }
    }

    useEffect(() => {
        if (web3) {
            return;
        }

        (async () => {
            const _web3 = await createWeb3();
            setWeb3(_web3);

            const _accounts = [(window as any).ethereum.selectedAddress];
            setAccounts(_accounts);
            console.log({ _accounts });

            if (_accounts && _accounts[0]) {
                const _l2Balance = BigInt(await _web3.eth.getBalance(_accounts[0]));
                setL2Balance(_l2Balance);
                const _contract = new CodeSnippetsWrapper(_web3);
                setContract(_contract);
            }
        })();
    });

    const LoadingIndicator = () => <span className="rotating-icon">⚙️</span>;

    return (
        <div className="main">
            <h1> 🖥 Nervos React Code Snippets</h1>
            <div className="acc-details">
                Your ETH address: <b>{accounts?.[0]}</b>
                <br />
                <hr />
                <br />
                Your Polyjuice address: <b>{polyjuiceAddress || ' - '}</b>
                <br />
                <hr />
                <br />
                Nervos Layer 2 balance:{' '}
                <b>{l2Balance ? (l2Balance / 10n ** 8n).toString() : <LoadingIndicator />} CKB</b>
                <br />
                <hr />
                <br />
                Deployed contract address: <b>{CONTRACT_ADDRESS}</b> <br />
                <br />
                <hr />
                <br />
                Deploy transaction hash: <b>{DEPLOY_HASH}</b>
                <br />
            </div>

            <div className="create-code">
                <h3>Share Your React Code Snippets with Nervos</h3>
                <textarea
                    rows={6}
                    onChange={e => setSnippet(e.target.value)}
                    placeholder="Write your code snippet here..."
                />
                <button onClick={createNewCodeSnippet}>Create New React Code Snippet</button>
            </div>
            <br />
            <br />
            <br />
            <br />
            <div className="show-codes">
                {!codes && <LoadingIndicator />}
                {codes?.map(code => {
                    return <ShowCodeSnippet key={code.id} code={code.text} />;
                })}
            </div>
            <br />
            <br />
            <ToastContainer />
        </div>
    );
}
