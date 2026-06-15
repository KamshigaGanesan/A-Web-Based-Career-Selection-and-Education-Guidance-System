const testLogin = async () => {
  try {
    const res = await fetch("http://127.0.0.1:5001/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "vipooshan9@gmail.com", password: "vipoo" })
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Data:", data);
  } catch (err) {
    console.error("Fetch error:", err.message);
  }
};

testLogin();
