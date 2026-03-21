const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'Tom', 'Emma', 'Alex', 'Lisa', 'David', 'Rachel'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const products = ['Laptop', 'Phone', 'Headphones', 'Monitor', 'Keyboard', 'Mouse', 'Desk', 'Chair', 'Webcam', 'Speaker'];

function getRandomItem(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

function generateRandomEmail(firstName, lastName) {
  const randomNumber = Math.floor(Math.random() * 1000);
  const firstNameLower = firstName.toLowerCase();
  const lastNameLower = lastName.toLowerCase();
  const email = firstNameLower + '.' + lastNameLower + randomNumber + '@email.com';
  return email;
}

function generateUserProfiles(count) {
  const users = [];
  for (let i = 1; i <= count; i++) {
    const firstName = getRandomItem(firstNames);
    const lastName = getRandomItem(lastNames);
    const fullName = firstName + ' ' + lastName;
    const email = generateRandomEmail(firstName, lastName);

    const randomMonth = Math.floor(Math.random() * 12);
    const randomDay = Math.floor(Math.random() * 28) + 1;
    const dateObj = new Date(2024, randomMonth, randomDay);
    const isoString = dateObj.toISOString();
    const datePart = isoString.split('T')[0];

    let isActive;
    if (Math.random() > 0.2) {
      isActive = 'active';
    } else {
      isActive = 'inactive';
    }

    const user = {
      id: i,
      name: fullName,
      email: email,
      created_at: datePart,
      status: isActive
    };

    users.push(user);
  }
  return users;
}

function generateShoppingCart(count) {
  const carts = [];
  for (let i = 1; i <= count; i++) {
    const quantity = Math.floor(Math.random() * 5) + 1;
    const price = Math.floor(Math.random() * 200) + 10;
    const randomUserId = Math.floor(Math.random() * 1000) + 1;
    const cartId = 'CART_' + i;
    const productName = getRandomItem(products);
    const total = quantity * price;

    const cart = {
      cart_id: cartId,
      user_id: randomUserId,
      product_name: productName,
      quantity: quantity,
      price: price,
      total: total
    };

    carts.push(cart);
  }
  return carts;
}

export { generateUserProfiles, generateShoppingCart };
