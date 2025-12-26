"use client";

import { Container, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useState, memo, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import EmployeeTabPanels from "../../components/EmployeeTabPanels";
import StatusMessage from "../../components/StatusMessage";
import ErrorBoundary from "../../components/ErrorBoundary";
import { useEmployees } from "../../hooks/useEmployees";
import type { TabKey } from "../../types/types";

const EmployeeProfilePage = () => {
  const { employees, loading, error, updateEmployee } = useEmployees();
  const { id } = useParams();

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [telegram, setTelegram] = useState<string>("");
  const [tab, setTab] = useState<TabKey>("info");
  const [phone, setPhone] = useState<string>("");

  const employee = employees.find((employee) => employee.id === id);

  useEffect(() => {
    if (employee) {
      setPhone(employee.phone || "");
      setTelegram(employee.telegram || "");
    }
  }, [employee]);

  const handleSaveChanges = useCallback(() => setOpenDialog(true), []);

  const handleConfirmSave = useCallback(() => {
    updateEmployee(id as string, { phone: phone || "", telegram: telegram || "" });
    setIsEditing(false);
    setOpenDialog(false);
  }, [id, phone, telegram, updateEmployee]);

  const handleCancelChanges = useCallback(() => {
    setPhone(employee?.phone || "");
    setTelegram(employee?.telegram || "");
    setIsEditing(false);
  }, [employee]);

  if (!employee) {
    return (
      <Container component="main" maxWidth="lg" sx={{ py: 4 }}>
        <Typography component="p" role="alert" aria-live="assertive" color="text.secondary">
          Employee not found
        </Typography>
      </Container>
    );
  }

  if (loading) {
    return <StatusMessage type="loading" message="Loading..." />;
  }

  if (error) {
    return <StatusMessage type="error" message={error} />;
  }

  return (
    <ErrorBoundary
      fallback={
        <Typography component="p" role="alert" aria-live="assertive" color="error">
          Something went wrong while loading the employee profile.
        </Typography>
      }
    >
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Stack component="header" spacing={2} sx={{ mb: 3 }}>
          <Typography component="h1" variant="h4" fontWeight={700} sx={{ fontSize: { xs: 24, md: 32 } }}>
            {employee.name}&apos;s Profile
          </Typography>

          <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile aria-label="Employee profile sections">
            <Tab label="Personal Info" value="info" id="employee-tab-info" aria-controls="employee-tabpanel-info" />
            <Tab label="Tasks" value="tasks" id="employee-tab-tasks" aria-controls="employee-tabpanel-tasks" />
          </Tabs>
        </Stack>

        <EmployeeTabPanels tab={tab} employee={employee} isEditing={isEditing} phone={phone} telegram={telegram} onEditToggle={setIsEditing} onPhoneChange={setPhone} onTelegramChange={setTelegram} onSave={handleSaveChanges} onCancel={handleCancelChanges} />

        <ConfirmationDialog open={openDialog} onClose={() => setOpenDialog(false)} onConfirm={handleConfirmSave} title="Confirm Changes" message="Are you sure you want to save these changes?" />
      </Container>
    </ErrorBoundary>
  );
};

export default memo(EmployeeProfilePage);
