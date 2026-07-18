"use client";

import { useState } from "react";
import { supabase } from "../utils/supabase/client";

export default function Home() {
  const [username, setUsername] = useState("");

  const saveUser = async () => {
    if (!username.trim()) return;

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          user_name: username,
        },
      ]);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    console.log(data);
    alert("User added successfully!");
    setUsername("");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border rounded px-4 py-2 w-80"
      />

      <button
        onClick={saveUser}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Save User
      </button>
    </div>
  );
}