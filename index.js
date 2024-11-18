async function fetchJsonData(path) {
	try {
		const response = await fetch(path);
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
		const data = await response.json();
		return data;
	} catch (error) {
		throw new Error(`Error loading JSON: ${error.message}`);
	}
}

function manageCartButton() {
	const wrapProduct = document.querySelector(".wrap-product");

	// Use event delegation to handle clicks on .cart-button
	wrapProduct.addEventListener("click", (e) => {
		// Look for the closest element with the class "cart-button"
		const cartBtn = e.target.closest(".cart-button");

		if (cartBtn) {
			// Use nextElementSibling to get the cart-plus-minus directly after the button
			const quantityControl = cartBtn.nextElementSibling;



			if (quantityControl) {
				if (cartBtn.classList.contains("active")) {
					// Remove active from the button, add it to cart-plus-minus
					cartBtn.classList.remove("active");
					quantityControl.classList.add("active");

					// Add item to the cart
					const productCard = cartBtn.closest(".grid-item");
					addToCart(productCard);
				}
			}
		}
	});
}

function addToCart(productCard) {
	
	const photo = productCard.querySelector(".image-container img").src;
	const productName = productCard.querySelector(".tertiary-header").innerText;
	const productPrice = parseFloat(productCard.querySelector(".item-price").innerText.replace("$", ""));
	let productQuantity = 1;

	// Create the new cart item markup
	const cartItem = document.createElement("article");
	cartItem.classList.add("cart-item");
	cartItem.setAttribute("data-label", `${productName}`);
	cartItem.innerHTML = `
	<div class="cart-quantity">
      <p class="cart-heading">${productName}</p>
      <div class="quantity-container">
		<span class="quantity">${productQuantity}x</span>
        <span class="each-item">@$${productPrice.toFixed(2)}</span>
        <span class="total-price">$${productPrice.toFixed(2)}</span>
      </div>
    </div>
    <button class="remove-item">
      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10">
        <path fill="" d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z" />
      </svg>
    </button>
  `;

	// Create the new cart popover item markup
	const cartItemPopover = document.createElement("article");
	cartItemPopover.classList.add("cart-item-popover");
	cartItemPopover.setAttribute("data-label", `${productName}`);
	cartItemPopover.innerHTML = `
	<figure class="image-container">
		<img src="${photo}" alt="${productName}" />
	</figure>
	<div class="cart-quantity">
      <p class="cart-heading">${productName}</p>
      <div class="quantity-container">
		<span class="quantity-value">${productQuantity}x</span>
        <span class="each-item">@ $${productPrice.toFixed(2)}</span>
      </div>
    </div>
	<div class="total-price">$${productPrice.toFixed(2)}</div>
  `;

	// Append the new cart item to the sidebar
	const cartContainer = document.querySelector(".cart-container");
	const popoverHeader = document.querySelector(".popover-header");
	if (cartContainer) {
		cartContainer.appendChild(cartItem);
		popoverHeader.appendChild(cartItemPopover);
	}

	const cartButton = productCard.querySelector(".cart-button");
	const cartPlusMinus = productCard.querySelector(".cart-plus-minus");
	const gridQuantity = productCard.querySelector(".item-quantity");
	const gridDataItem = productCard.getAttribute(`${productName}`);
	const dataCartItem = cartItem.getAttribute(`${productName}`);
	changeCartCount();

	// Add functionality to remove the item from the cart
	const removeButton = cartItem.querySelector(".remove-item");
	const quantitySpan = cartItem.querySelector(".quantity");
	const totalSpan = cartItem.querySelector(".total-price");
	const spanPopover = cartItemPopover.querySelector(".quantity");
	const totalSpanPopover = cartItemPopover.querySelector(".total-price");

	removeButton.addEventListener("click", () => {
		cartContainer.removeChild(cartItem);
		popoverHeader.removeChild(cartItemPopover);
		changeCartCount();

		if (gridDataItem == dataCartItem) {
			cartPlusMinus.classList.remove("active");
			cartButton.classList.add("active");
			gridQuantity.innerHTML = 1;
		}
	});

	// Add functionality for increment and decrement quantity
	const incrementButton = productCard.querySelector(".increment");
	const decrementButton = productCard.querySelector(".decrement");

	incrementButton.addEventListener("click", () => {
		productQuantity++;
		quantitySpan.innerText = `${productQuantity}x`;
		totalSpan.innerText = `$${(productPrice * productQuantity).toFixed(2)}`;
		spanPopover.innerText = `${productQuantity}x`;
		totalSpanPopover.innerText = `$${(productPrice * productQuantity).toFixed(2)}`;
		changeCartCount();
	});

	decrementButton.addEventListener("click", () => {
		if (productQuantity > 1) {
			productQuantity--;
			quantitySpan.innerText = `${productQuantity}x`;
			totalSpan.innerText = `$${(productPrice * productQuantity).toFixed(2)}`;
			spanPopover.innerText = `${productQuantity}x`;
			totalSpanPopover.innerText = `$${(productPrice * productQuantity).toFixed(2)}`;
			changeCartCount();
		}
	});
}

function setupCartPlusMinus() {
	const wrapProduct = document.querySelector(".wrap-product");

	if (!wrapProduct) {
		console.error("productWrap not found");
		return;
	}

	wrapProduct.addEventListener("click", (e) => {
		const decrementButton = e.target.closest(".decrement");
		const incrementButton = e.target.closest(".increment");

		if (decrementButton) {
			itemQuantitySpan = decrementButton.nextElementSibling;
			if (itemQuantitySpan && itemQuantitySpan.classList.contains("item-quantity")) {
				let quantity = parseInt(itemQuantitySpan.innerText);
				if (quantity > 1) {
					itemQuantitySpan.innerText = quantity - 1;
				}
			}
		}

		if (incrementButton) {
			itemQuantitySpan = incrementButton.previousElementSibling;
			if (itemQuantitySpan && itemQuantitySpan.classList.contains("item-quantity")) {
				let quantity = parseInt(itemQuantitySpan.innerText);
				itemQuantitySpan.innerText = quantity + 1;
			}
		}
	});
}

function changeCartCount() {
	const cartItem = document.querySelectorAll(".cart-item");
	const cartCount = document.querySelector(".item-count");
	const totalCart = document.querySelector(".total-amount");
	const cartTotalAmountPopover = document.querySelector(".popover-total");
	let totalQuantity = 0;
	let totalAmount = 0;

	cartItem.forEach((item) => {
		const quantityValue = item.querySelector(".quantity-value").innerText;
		const quantity = parseInt(quantityValue);
		totalQuantity += quantity;

		const totalPrice = item.querySelector(".total-price").innerText.replace("$", "");
		const total = parseFloat(totalPrice);
		totalAmount += total;
	});

	if (cartCount) {
		cartCount.innerText = `Your Cart (${totalQuantity})`;
	}

	if (totalCart) {
		totalCart.innerHTML = `$${totalAmount.toFixed(2)}`;
		cartTotalAmountPopover.innerHTML = `$${totalAmount.toFixed(2)}`;
	}
}

function deleteCart() {
	const deleteCartItem = document.getElementById("delete-cart");

	deleteCartItem.addEventListener("click", () => {
		// Select the cart items at the time of the click event
		const cartItem = document.querySelectorAll(".cart-item");
		const cartItemPopovers = document.querySelectorAll(".cart-item-popover");
		console.log(cartItem.length);

		// Loop through all cart items and remove them
		if (cartItem.length >= 1) {
			cartItem.forEach((item) => item.remove());
			cartItemPopovers.forEach((item) => item.remove());
		}

		// Reset grid items
		const productItems = document.querySelectorAll(".grid-item");
		productItems.forEach((gridItem) => {
			const cartButton = gridItem.querySelector(".cart-button");
			const cartPlusMinus = gridItem.querySelector(".cart-plus-minus");
			const gridItemQuantity = gridItem.querySelector(".item-quantity");

			// Reset button classes and quantity
			cartButton.classList.add("active");
			cartPlusMinus.classList.remove("active");
			gridItemQuantity.innerHTML = 1;
		});

		// Update the cart item count and total amount after clearing
		changeCartCount();
	});
}

document.addEventListener("DOMContentLoaded", () => {
	fetchJsonData("data.json")
		.then((data) => {
			const productWrap = document.querySelector(".wrap-product");
			data.forEach((item) => {
				const article = document.createElement("article");
				article.classList.add("grid-item");
				article.setAttribute("data-label", `${item.name}`);
				let itemQuantity = 1;
				article.innerHTML = `
					<div class="button-container">
						<figure class="image-container">
							<img src="${item.image.desktop}" alt="${item.name}" />
						</figure>
						<button class="cart-button active">
							<svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" fill="none" viewBox="0 0 21 20">
								<g fill="#C73B0F" clip-path="url(#a)">
									<path d="M6.583 18.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM15.334 18.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM3.446 1.752a.625.625 0 0 0-.613-.502h-2.5V2.5h1.988l2.4 11.998a.625.625 0 0 0 .612.502h11.25v-1.25H5.847l-.5-2.5h11.238a.625.625 0 0 0 .61-.49l1.417-6.385h-1.28L16.083 10H5.096l-1.65-8.248Z" />
									<path d="M11.584 3.75v-2.5h-1.25v2.5h-2.5V5h2.5v2.5h1.25V5h2.5V3.75h-2.5Z" />
								</g>
								<defs>
									<clipPath id="a">
										<path fill="#fff" d="M.333 0h20v20h-20z" />
									</clipPath>
								</defs>
							</svg>
							Add to Cart
						</button>
						<div class="cart-plus-minus">
							<span class="access-hidden">Cart Quantity</span>
							<button class="more-less decrement">
								<svg xmlns="http://www.w3.org/2000/svg" width="10" height="2" fill="none" viewBox="0 0 10 2">
									<path fill="" d="M0 .375h10v1.25H0V.375Z" />
								</svg>
							</button>
							<span class="item-quantity">${itemQuantity}</span>
							<button class="more-less increment">
								<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10">
									<path fill="" d="M10 4.375H5.625V0h-1.25v4.375H0v1.25h4.375V10h1.25V5.625H10v-1.25Z" />
								</svg>
							</button>
						</div>
					</div>
					<div class="item-category">${item.category}</div>
					<h3 class="tertiary-header">${item.name}</h3>
					<div class="item-price">$${item.price.toFixed(2)}</div>
				`;
				productWrap.appendChild(article);
			});
			manageCartButton();
			setupCartPlusMinus();
			changeCartCount();
			deleteCart();
		})
		.catch((error) => {
			console.error("Error loading JSON data: ", error);
		});
});