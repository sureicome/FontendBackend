import { useState, useEffect } from "react";
import { ethers } from "ethers";
// import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";
import abi_new from "../pages/abi_new.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  const contractAddress = "0x5Db0fCE5Fd849Ec158dECD95221d58D2B4A3aAf8";
  // const atmABI = atm_abi.abi;
  const atmABI = abi_new;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts && accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    try {
      if (atm) {
        const balance = await atm.getBalance();
        setBalance(ethers.utils.formatEther(balance));
      }
    } catch (error) {
      console.error("Error getting balance:", error);
      alert("Error getting balance. Please check the console for details.");
    }
  };

  const deposit = async () => {
    try {
      if (atm && depositAmount) {
        let tx = await atm.deposit({ value: ethers.utils.parseEther(depositAmount) });
        await tx.wait();
        getBalance();
      }
    } catch (error) {
      console.error("Error depositing:", error);
      alert("Error depositing. Please check the console for details.");
    }
  };

  const withdraw = async () => {
    try {
      if (atm && withdrawAmount) {
        let tx = await atm.withdraw(ethers.utils.parseEther(withdrawAmount));
        await tx.wait();
        getBalance();
      }
    } catch (error) {
      console.error("Error withdrawing:", error);
      alert("Error withdrawing. Please check the console for details.");
    }
  };

  const transfer = async () => {
    try {
      if (atm && recipient && transferAmount) {
        let tx = await atm.transfer(recipient, ethers.utils.parseEther(transferAmount));
        await tx.wait();
        getBalance();
      }
    } catch (error) {
      console.error("Error transferring:", error);
      alert("Error transferring. Please check the console for details.");
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p style={{fontSize: "20px"}}>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance} ETH</p>
        <div>
          <input
            type="text"
            placeholder="Amount to deposit"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />
          <button onClick={deposit}>Deposit ETH</button>
        </div>
        <div>
          <input
            type="text"
            placeholder="Amount to withdraw"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
          <button onClick={withdraw}>Withdraw ETH</button>
        </div>
        <div>
          <input
            type="text"
            placeholder="Recipient address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <input
            type="text"
            placeholder="Amount to transfer"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
          />
          <button onClick={transfer}>Transfer ETH</button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
