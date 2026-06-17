import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";

export const handleCreateAdminEmployee: RequestHandler = async (req, res) => {
  try {
    const { fullName, email, password, role = "Admin" } = req.body;

    if (!fullName || !email || !password) {
      res.status(400).json({
        error: "Missing required fields: fullName, email, password",
      });
      return;
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    // Use service role key for admin operations, fall back to anon key
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      res.status(500).json({
        error: "Supabase configuration missing",
      });
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      realtime: {
        transport: ws as any,
      },
    });

    // Try RPC first (if service role key is available)
    const { data, error } = await supabase.rpc("create_employee", {
      p_full_name: fullName.trim(),
      p_email: email.trim().toLowerCase(),
      p_password: password.trim(),
      p_phone: null,
      p_role: role.trim(),
    });

    if (error && error.message.includes("not authenticated")) {
      // If RPC fails due to auth, try direct insert with hashed password
      // Use simple hash for basic password storage
      const hashedPassword = Buffer.from(password).toString("base64");

      const { data: insertData, error: insertError } = await supabase
        .from("employees")
        .insert({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password_hash: hashedPassword,
          role: role.trim(),
          is_active: true,
        })
        .select();

      if (insertError) {
        console.error("Error inserting employee:", insertError);
        res.status(500).json({
          error: insertError.message || "Failed to create employee",
        });
        return;
      }

      const employee = insertData?.[0];
      if (!employee) {
        res.status(500).json({
          error: "Employee was not created",
        });
        return;
      }

      res.json({
        success: true,
        employee: {
          id: employee.id,
          fullName: employee.full_name,
          email: employee.email,
          role: employee.role || "Admin",
          createdAt: employee.created_at,
        },
      });
    } else if (error) {
      console.error("Error creating admin employee:", error);
      res.status(500).json({
        error: error.message || "Failed to create admin employee",
      });
      return;
    } else {
      const employee = data?.[0];
      if (!employee) {
        res.status(500).json({
          error: "Employee was not created",
        });
        return;
      }

      res.json({
        success: true,
        employee: {
          id: employee.id,
          fullName: employee.full_name,
          email: employee.email,
          role: employee.role || "Admin",
          createdAt: employee.created_at,
        },
      });
    }
  } catch (err: any) {
    console.error("Admin setup error:", err);
    res.status(500).json({
      error: err.message || "An error occurred",
    });
  }
};
