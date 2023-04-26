import detectEthereumProvider from "@metamask/detect-provider";
import { ethers } from "ethers";
import "./App.css";
import { useEffect, useState } from "react";
import votingAbi from "./contracts/voting.json";

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [votingContract, setVotingContract] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    if (signer) {
      setIsConnected(true);
      signer.getAddress().then((address) => {
        setAddress(address);
      });
    }
  }, [signer]);

  function disconnect() {
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
  }

  async function connect() {
    const provider = await detectEthereumProvider();
    if (provider) {
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const ethersSigner = ethersProvider.getSigner();
      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setIsConnected(true);
    } else {
      console.log("Please install MetaMask!");
    }
  }

  useEffect(() => {
    if (isConnected) {
      console.log("votingAbi", votingAbi.abi);
      const contractAddress = "0x9298B2E081E7F604028d75dF5d15155353612d4c";
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        votingAbi.abi,
        signer
      );
      setVotingContract(contract);

      const getCandidateData = async () => {
        const candidatesCount = await contract.candidatesCount();
        const candidatesData = [];
        for (let i = 0; i < candidatesCount; i++) {
          const candidate = await contract.candidates(i);
          console.log("candidate =>", candidate);
          candidatesData.push({
            id: i,
            name: candidate[0],
            voteCount: candidate[1].toNumber(),
          });
        }
        setCandidates(candidatesData);
      };
      console.log("candidates array =>", candidates);
      getCandidateData();
      console.log(votingContract);
    }
  }, [isConnected]);

  useEffect(() => {
    console.log("selectedCandidate =>", selectedCandidate);
  }, [selectedCandidate]);

  const handleVote = () => {
    console.log("voting for", selectedCandidate);
    votingContract.vote(selectedCandidate).then((res) => {
      console.log("success");
      console.log("res =>", res);
    });
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Connect your wallet</h1>
      {isConnected ? (
        <div>
          <div className="text-xl font-bold mb-2">
            Wallet Connected: {address}
          </div>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={disconnect}
          >
            Disconnect Wallet
          </button>
          <hr className="my-4" />
          <h2 className="text-2xl font-semibold mb-2">Dashboard</h2>
          <hr className="my-4" />
          <h3 className="text-xl font-semibold mb-2">Candidate List</h3>
          <ul className="list-none">
            {candidates?.map((candidate) => (
              <li
                key={candidate.id}
                className="border-b-2 border-gray-300 py-2"
              >
                <div>Id: {candidate.id}</div>
                <div>Name: {candidate.name}</div>
                <div>Vote Count: {candidate.voteCount}</div>
              </li>
            ))}
          </ul>
          <h3 className="text-xl font-semibold mb-2 mt-4">
            Vote for your favorite candidate:
          </h3>
          <form>
            <label className="block mb-2" htmlFor="candidate">
              Select a candidate:
            </label>
            <input
              className="border-2 border-gray-300 rounded px-2 py-1 mb-2"
              type="number"
              id="candidate"
              value={selectedCandidate}
              onChange={(event) =>
                setSelectedCandidate(parseInt(event.target.value))
              }
            />
            <br />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              type="button"
              onClick={handleVote}
            >
              Vote
            </button>
          </form>
        </div>
      ) : (
        <div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={connect}
          >
            Connect With MetaMask
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
