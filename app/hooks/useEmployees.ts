import { useState, useEffect } from "react";
import type { Employee } from "../types/types";

export const useEmployees = (id?: string) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const handleEmployeeData = (employeesData: Employee[]) => {
      if (id) {
        const foundEmployee = employeesData.find((emp) => emp.id === id);
        setEmployee(foundEmployee || null);
      } else {
        setEmployees(employeesData);
      }
    };

    (async () => {
      setLoading(true);
      setError(null);

      const storedEmployees = localStorage.getItem("employees");

      if (storedEmployees) {
        const employeesData: Employee[] = JSON.parse(storedEmployees);
        handleEmployeeData(employeesData);
        setLoading(false);
      } else {
        setTimeout(async () => {
          try {
            const { employees } = await import("../../public/employees.json");
            const employeesData = employees as Employee[];

            handleEmployeeData(employeesData);

            localStorage.setItem("employees", JSON.stringify(employeesData));
          } catch (error) {
            console.error(error);
            setError("Error fetching employees");
          } finally {
            setLoading(false);
          }
        }, 1000);
      }
    })();
  }, [id]);

  const updateEmployee = (id: string, updatedData: Partial<Employee>) =>
    setEmployees((prevEmployees) => {
      const updatedEmployees = prevEmployees.map((employee) => (employee.id === id ? { ...employee, ...updatedData } : employee));
      localStorage.setItem("employees", JSON.stringify(updatedEmployees));

      return updatedEmployees;
    });

  return { employees, employee, loading, error, updateEmployee };
};
