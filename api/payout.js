import { TonClient, WalletContractV4, internal, toNano } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { recipientAddress, amountInTon } = req.body;
  if (!recipientAddress || !amountInTon) return res.status(400).json({ error: 'Missing parameters' });

  try {
    const client = new TonClient({
      endpoint: 'https://toncenter.com/api/v2/jsonRPC',
      apiKey: process.env.TONCENTER_API_KEY
    });
    const mnemonic = (process.env.HOT_WALLET_MNEMONIC || '').trim().split(' ');
    if (mnemonic.length < 24) throw new Error('Invalid HOT_WALLET_MNEMONIC in environment variables');

    const key = await mnemonicToPrivateKey(mnemonic);
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
    const walletContract = client.open(wallet);
    const seqno = await walletContract.getSeqno();

    await walletContract.sendTransfer({
      seqno,
      secretKey: key.secretKey,
      messages: [
        internal({
          to: recipientAddress,
          value: toNano(amountInTon.toString()),
          bounce: false,
          body: 'CyberNode Live Earnings Payout'
        })
      ]
    });

    return res.status(200).json({ success: true, message: 'On-chain transaction sent!' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
