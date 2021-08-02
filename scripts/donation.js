module.exports = {
    showDialog: async function (dp, wax) {
        var modal = document.getElementById("myModal");
        var span = document.getElementById("closeSpan");
        var content = document.getElementById("content");
        var input = document.getElementById("quantity");

        content.innerText = "With how much WAX do you wanna donate RAM?";

        modal.style.display = "block";
        var donationModule = this;

        span.onclick = async function () {
            modal.style.display = "none";

            //Get user input
            var userinput = dp.sanitize(input.value);

            if (userinput != "") userinput = parseFloat(userinput);

            console.log(typeof userinput);
            //Do transaction with the userinput
            if (typeof userinput != "number") alert("Please input a number");
            else {

                donationModule.sendDonation(wax, userinput);
            }
        };

        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        };
    },
    sendDonation: async function (wax, amount) {
        if (wax.userAccount === undefined) {
            await wax.login();
        }

        //convert amount into the right format
        var quantity = amount.toString();

        quantity = quantity + ".00000000 WAX";
        console.log(quantity);

        //execute transaction


        const action =
            {
                account: "eosio",
                name: "buyram",
                authorization: [
                    {
                        actor: wax.userAccount,
                        permission: "active",
                    },
                ],
                data: {
                    payer: wax.userAccount,
                    receiver: "waxclicker12", //Später smart contract Name
                    quant: quantity,
                },
            }

        session.transact({action}).then(({transaction}) => {
            console.log(`Transaction broadcast! Id: ${transaction.id}`)
        })
    },
    onClickFunction: async function (modal, dp, input, wax) {
        modal.style.display = "none";

        //Get user input
        var userinput = dp.sanitize(input.value);

        if (userinput != "") userinput = parseFloat(userinput);

        console.log(typeof userinput);
        //Do transaction with the userinput
        if (typeof userinput != "number") alert("Please input a number");
        else {
            console.log(this);
            await this.sendDonation(wax, userinput);
        }
    }
}