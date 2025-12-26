"use client";

import { Box, Button, Chip, Container, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, TextField, Typography } from "@mui/material";
import { ChangeEvent, memo, useCallback, useMemo, useState } from "react";
import { generateCSV } from "../services/csvExportService";
import StatusMessage from "../components/StatusMessage";
import ErrorBoundary from "../components/ErrorBoundary";
import type { FilteredEmployee } from "../types/types";
import EmployeeCard from "../components/EmployeeCard";
import { useEmployees } from "../hooks/useEmployees";

const TeamPage = () => {
  const { employees, loading, error } = useEmployees();

  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleDepartmentChange = useCallback((event: SelectChangeEvent) => {
    setSelectedDepartment(event.target.value);
  }, []);

  const filteredEmployees = useMemo(
    () =>
      employees.filter((employee) => {
        const matchesName = employee.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment = selectedDepartment === "All" || employee.department === selectedDepartment;

        return matchesName && matchesDepartment;
      }),
    [employees, searchTerm, selectedDepartment]
  );

  if (loading) {
    return <StatusMessage type="loading" message="Loading..." />;
  }

  if (error) {
    return <StatusMessage type="error" message={error} />;
  }

  const handleExportClick = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const formattedEmployees: FilteredEmployee[] = filteredEmployees.map(({ avatarUrl, ...rest }) => rest);
    generateCSV(formattedEmployees, "team_list.csv");
  };

  return (
    <ErrorBoundary
      fallback={
        <Typography component="p" role="alert" aria-live="assertive" color="error">
          Something went wrong while loading the team.
        </Typography>
      }
    >
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Stack component="header" direction={{ xs: "column", md: "row" }} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography component="h1" variant="h4" fontWeight={700} sx={{ fontSize: { xs: 24, md: 32 } }}>
              Team
            </Typography>
            <Stack direction="row" spacing={1} mt={1}>
              <Chip label={`Total: ${employees.length}`} size="small" aria-label={`Total employees: ${employees.length}`} />
              <Chip color="primary" label={`Found: ${filteredEmployees.length}`} size="small" aria-label={`Employees found: ${filteredEmployees.length}`} />
            </Stack>
          </Box>

          <Button variant="contained" color="primary" onClick={handleExportClick} aria-label="Export team list to CSV file" sx={{ alignSelf: { xs: "stretch", md: "auto" } }}>
            Export CSV
          </Button>
        </Stack>

        <Stack component="section" aria-label="Employee filters" direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
          <TextField fullWidth variant="outlined" placeholder="Search by name" value={searchTerm} onChange={handleSearchChange} aria-label="Search employees by name" />
          <FormControl fullWidth>
            <InputLabel id="department-label">Department</InputLabel>
            <Select labelId="department-label" label="Department" value={selectedDepartment} onChange={handleDepartmentChange} aria-label="Filter employees by department">
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Sales">Sales</MenuItem>
              <MenuItem value="Technical">Technical</MenuItem>
              <MenuItem value="Finance">Finance</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {filteredEmployees.length === 0 ? (
          <Box
            role="status"
            aria-live="polite"
            sx={{
              py: 8,
              textAlign: "center",
              bgcolor: "background.paper",
              borderRadius: 2,
              border: "1px dashed",
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No employees found
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Try adjusting the search criteria or department filter
            </Typography>
          </Box>
        ) : (
          <Box
            component="section"
            role="list"
            aria-label="Employee list"
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              alignItems: "stretch",
            }}
          >
            {filteredEmployees.map((employee) => (
              <EmployeeCard key={employee.id} employee={employee} />
            ))}
          </Box>
        )}
      </Container>
    </ErrorBoundary>
  );
};

export default memo(TeamPage);
