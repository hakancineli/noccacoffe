const fetch = require('node-fetch');

async function testPin() {
    const orderData = {
        items: [
            {
                productId: "cmloe2pnd0001k9wn3ituex54", // Espresso
                productName: "Espresso",
                quantity: 1,
                unitPrice: 50,
                totalPrice: 50,
                size: "S"
            }
        ],
        totalAmount: 50,
        finalAmount: 50,
        discountAmount: 0,
        status: 'COMPLETED',
        paymentMethod: 'CASH',
        customerName: 'Test User',
        staffPin: '4444' // Hakan's PIN
    };

    const res = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    });

    const data = await res.json();
    console.log('Response Status:', res.status);
    console.log('Response Data:', data);
}

testPin().catch(console.error);
