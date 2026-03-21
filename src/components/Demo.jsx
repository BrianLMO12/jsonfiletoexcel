import { useState } from 'react';
import { generateUserProfiles, generateShoppingCart } from '../utils/generateData';
import { downloadJSON, downloadCSV, downloadExcel } from '../utils/fileConverter';
import { MdDownload, MdRefresh, MdEdit } from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

function Demo() {
  const [userCount, setUserCount] = useState(10);
  const [cartCount, setCartCount] = useState(10);
  const [userData, setUserData] = useState(null);
  const [cartData, setCartData] = useState(null);
  const [isGeneratingUsers, setIsGeneratingUsers] = useState(false);
  const [isGeneratingCarts, setIsGeneratingCarts] = useState(false);
  const [isLoadingUserJson, setIsLoadingUserJson] = useState(false);
  const [isLoadingUserCsv, setIsLoadingUserCsv] = useState(false);
  const [isLoadingUserExcel, setIsLoadingUserExcel] = useState(false);
  const [isLoadingCartJson, setIsLoadingCartJson] = useState(false);
  const [isLoadingCartCsv, setIsLoadingCartCsv] = useState(false);
  const [isLoadingCartExcel, setIsLoadingCartExcel] = useState(false);

  function generateUsers() {
    const count = parseInt(userCount);
    let parsedCount;
    if (isNaN(count)) {
      parsedCount = 0;
    } else {
      parsedCount = count;
    }

    if (parsedCount > 0) {
      setIsGeneratingUsers(true);
      setTimeout(function () {
        setUserData(generateUserProfiles(parsedCount));
        setIsGeneratingUsers(false);
      }, 600);
    }
  }

  function generateCarts() {
    const count = parseInt(cartCount);
    let parsedCount;
    if (isNaN(count)) {
      parsedCount = 0;
    } else {
      parsedCount = count;
    }

    if (parsedCount > 0) {
      setIsGeneratingCarts(true);
      setTimeout(function () {
        setCartData(generateShoppingCart(parsedCount));
        setIsGeneratingCarts(false);
      }, 600);
    }
  }

  function downloadData(data, format, filename) {
    if (format === 'json') {
      downloadJSON(data, filename);
    } else if (format === 'csv') {
      downloadCSV(data, filename);
    } else if (format === 'excel') {
      downloadExcel(data, filename);
    }
  }

  function handleUserCountChange(e) {
    setUserCount(e.target.value);
  }

  function handleCartCountChange(e) {
    setCartCount(e.target.value);
  }

  function renderUserTable() {
    const rows = [];
    for (let i = 0; i < 5 && i < userData.length; i++) {
      const user = userData[i];
      rows.push(
        <tr key={user.id} className="hover:bg-gray-50">
          <td className="px-6 py-4 text-sm text-gray-700">{user.id}</td>
          <td className="px-6 py-4 text-sm text-gray-700">{user.name}</td>
          <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
          <td className="px-6 py-4 text-sm text-gray-700">{user.created_at}</td>
          <td className="px-6 py-4 text-sm">
            <span className={user.status === 'active' ? 'text-green-600 font-medium' : 'text-gray-600 font-medium'}>
              {user.status}
            </span>
          </td>
        </tr>
      );
    }
    return rows;
  }

  function renderCartTable() {
    const rows = [];
    for (let i = 0; i < 5 && i < cartData.length; i++) {
      const cart = cartData[i];
      rows.push(
        <tr key={cart.cart_id} className="hover:bg-gray-50">
          <td className="px-6 py-4 text-sm text-gray-700">{cart.cart_id}</td>
          <td className="px-6 py-4 text-sm text-gray-700">{cart.user_id}</td>
          <td className="px-6 py-4 text-sm text-gray-700">{cart.product_name}</td>
          <td className="px-6 py-4 text-sm text-gray-700">{cart.quantity}</td>
          <td className="px-6 py-4 text-sm font-medium text-gray-700">{'$' + cart.price}</td>
          <td className="px-6 py-4 text-sm font-bold text-gray-900">{'$' + cart.total}</td>
        </tr>
      );
    }
    return rows;
  }

  function handleUserDownloadJson() {
    setIsLoadingUserJson(true);
    setTimeout(function () {
      downloadData(userData, 'json', 'user_profiles.json');
      setIsLoadingUserJson(false);
    }, 600);
  }

  function handleUserDownloadCsv() {
    setIsLoadingUserCsv(true);
    setTimeout(function () {
      downloadData(userData, 'csv', 'user_profiles.csv');
      setIsLoadingUserCsv(false);
    }, 600);
  }

  function handleUserDownloadExcel() {
    setIsLoadingUserExcel(true);
    setTimeout(function () {
      downloadData(userData, 'excel', 'user_profiles.xlsx');
      setIsLoadingUserExcel(false);
    }, 600);
  }

  function handleCartDownloadJson() {
    setIsLoadingCartJson(true);
    setTimeout(function () {
      downloadData(cartData, 'json', 'shopping_carts.json');
      setIsLoadingCartJson(false);
    }, 600);
  }

  function handleCartDownloadCsv() {
    setIsLoadingCartCsv(true);
    setTimeout(function () {
      downloadData(cartData, 'csv', 'shopping_carts.csv');
      setIsLoadingCartCsv(false);
    }, 600);
  }

  function handleCartDownloadExcel() {
    setIsLoadingCartExcel(true);
    setTimeout(function () {
      downloadData(cartData, 'excel', 'shopping_carts.xlsx');
      setIsLoadingCartExcel(false);
    }, 600);
  }

  return (
    <div className="space-y-8">
      {/* User Profiles Section */}
      <div className="glass-card p-8">
        <h2 className="text-3xl font-bold mb-8 text-black">User Profiles</h2>

        <div className="mb-8">
          <label className="block text-gray-700 font-semibold mb-4">
            Generate Test Data
          </label>
          <div className="flex gap-4 items-center">
            <input
              type="number"
              value={userCount}
              onChange={handleUserCountChange}
              min="1"
              max="1000"
              className="input-glass w-32"
              disabled={isGeneratingUsers}
            />
            <button
              onClick={generateUsers}
              className="glass-btn"
              disabled={isGeneratingUsers}
            >
              {isGeneratingUsers ? (
                <AiOutlineLoading3Quarters className="icon-md spin-icon" />
              ) : (
                <MdRefresh className="icon-md" />
              )}
              {isGeneratingUsers ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>

        {userData !== null ? (
          <div>
            <h3 className="text-lg font-bold mb-6 text-black">
              Preview ({userData.length} records)
            </h3>
            <div className="overflow-x-auto mb-8 bg-white rounded-20 border border-gray-200">
              <table className="table-glass w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Created</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {renderUserTable()}
                </tbody>
              </table>
              {userData.length > 5 ? (
                <div className="px-6 py-4 text-gray-600 text-sm bg-gray-50">
                  {'... and ' + (userData.length - 5) + ' more records'}
                </div>
              ) : null}
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleUserDownloadJson}
                className="glass-btn"
                disabled={isLoadingUserJson}
              >
                {isLoadingUserJson ? (
                  <AiOutlineLoading3Quarters className="icon-md spin-icon" />
                ) : (
                  <MdDownload className="icon-md" />
                )}
                {isLoadingUserJson ? 'Downloading...' : 'JSON'}
              </button>
              <button
                onClick={handleUserDownloadCsv}
                className="glass-btn"
                disabled={isLoadingUserCsv}
              >
                {isLoadingUserCsv ? (
                  <AiOutlineLoading3Quarters className="icon-md spin-icon" />
                ) : (
                  <MdDownload className="icon-md" />
                )}
                {isLoadingUserCsv ? 'Downloading...' : 'CSV'}
              </button>
              <button
                onClick={handleUserDownloadExcel}
                className="glass-btn"
                disabled={isLoadingUserExcel}
              >
                {isLoadingUserExcel ? (
                  <AiOutlineLoading3Quarters className="icon-md spin-icon" />
                ) : (
                  <MdDownload className="icon-md" />
                )}
                {isLoadingUserExcel ? 'Downloading...' : 'Excel'}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Shopping Cart Section */}
      <div className="glass-card p-8">
        <h2 className="text-3xl font-bold mb-8 text-black">Shopping Cart Data</h2>

        <div className="mb-8">
          <label className="block text-gray-700 font-semibold mb-4">
            Generate Test Data
          </label>
          <div className="flex gap-4 items-center">
            <input
              type="number"
              value={cartCount}
              onChange={handleCartCountChange}
              min="1"
              max="1000"
              className="input-glass w-32"
              disabled={isGeneratingCarts}
            />
            <button
              onClick={generateCarts}
              className="glass-btn"
              disabled={isGeneratingCarts}
            >
              {isGeneratingCarts ? (
                <AiOutlineLoading3Quarters className="icon-md spin-icon" />
              ) : (
                <MdRefresh className="icon-md" />
              )}
              {isGeneratingCarts ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>

        {cartData !== null ? (
          <div>
            <h3 className="text-lg font-bold mb-6 text-black">
              Preview ({cartData.length} records)
            </h3>
            <div className="overflow-x-auto mb-8 bg-white rounded-20 border border-gray-200">
              <table className="table-glass w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Cart ID</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">User ID</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Product</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Qty</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {renderCartTable()}
                </tbody>
              </table>
              {cartData.length > 5 ? (
                <div className="px-6 py-4 text-gray-600 text-sm bg-gray-50">
                  {'... and ' + (cartData.length - 5) + ' more records'}
                </div>
              ) : null}
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleCartDownloadJson}
                className="glass-btn"
                disabled={isLoadingCartJson}
              >
                {isLoadingCartJson ? (
                  <AiOutlineLoading3Quarters className="icon-md spin-icon" />
                ) : (
                  <MdDownload className="icon-md" />
                )}
                {isLoadingCartJson ? 'Downloading...' : 'JSON'}
              </button>
              <button
                onClick={handleCartDownloadCsv}
                className="glass-btn"
                disabled={isLoadingCartCsv}
              >
                {isLoadingCartCsv ? (
                  <AiOutlineLoading3Quarters className="icon-md spin-icon" />
                ) : (
                  <MdDownload className="icon-md" />
                )}
                {isLoadingCartCsv ? 'Downloading...' : 'CSV'}
              </button>
              <button
                onClick={handleCartDownloadExcel}
                className="glass-btn"
                disabled={isLoadingCartExcel}
              >
                {isLoadingCartExcel ? (
                  <AiOutlineLoading3Quarters className="icon-md spin-icon" />
                ) : (
                  <MdDownload className="icon-md" />
                )}
                {isLoadingCartExcel ? 'Downloading...' : 'Excel'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Demo;
