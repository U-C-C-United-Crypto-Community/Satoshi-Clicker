window.addEventListener('load', async () => {
  if (window.ethereum) {
    window.web3 = new Web3(ethereum);
    try {
      await ethereum.enable();
      initPayButton()
    } catch (err) {
      $('#status').html('User denied account access', err)
    }
  } else if (window.web3) {
    window.web3 = new Web3(web3.currentProvider)
    initPayButton()
  } else {
    $('#status').html('No Metamask (or other Web3 Provider) installed')
  }
})

const initPayButton = () => {
  $('.pay-button').click(() => {
    // paymentAddress is where funds will be send to
    const paymentAddress = '0x192c96bfee59158441f26101b2db1af3b07feb40'
    const amountEth = 1

    web3.eth.sendTransaction({
      to: paymentAddress,
      value: web3.toWei(amountEth, 'ether')
    }, (err, transactionId) => {
      if  (err) {
        console.log('Payment failed', err)
        $('#status').html('Payment failed')
      } else {
        console.log('Payment successful', transactionId)
        $('#status').html('Payment successful')
      }
    })
  })
}