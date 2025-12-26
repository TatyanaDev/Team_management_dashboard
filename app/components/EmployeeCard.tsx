import { Box, Card, CardActionArea, CardContent, Chip, ChipProps, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { FC, memo } from "react";
import Image from "next/image";
import type { Employee } from "../types/types";

const statusColor = (status: string): ChipProps["color"] => {
  switch (status?.toLowerCase()) {
    case "active":
      return "success";
    case "inactive":
      return "error";
    default:
      return "default";
  }
};

interface EmployeeCardProps {
  employee: Employee;
}

const EmployeeCard: FC<EmployeeCardProps> = ({ employee }) => {
  const router = useRouter();

  const handleClick = () => router.push(`/team/${employee.id}`);

  return (
    <Card
      variant="outlined"
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        transition: "transform 120ms ease, box-shadow 120ms ease",
        "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
      }}
      role="listitem"
    >
      <CardActionArea onClick={handleClick} sx={{ height: "100%", alignItems: "stretch" }} aria-label={`Open profile of ${employee.name}`} aria-labelledby={`employee-title-${employee.id}`} aria-describedby={`employee-desc-${employee.id}`}>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: { xs: 160, md: 180 },
            bgcolor: "grey.100",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            overflow: "hidden",
          }}
        >
          <Image src={employee.avatarUrl} alt={`${employee.name} profile photo`} fill sizes="(max-width:600px) 100vw, (max-width:1200px) 50vw, 25vw" priority />
        </Box>

        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 0.5, flexGrow: 1 }}>
          <Typography id={`employee-title-${employee.id}`} variant="h6" component="h3" sx={{ fontSize: { xs: 16, md: 18 } }} noWrap>
            {employee.name}
          </Typography>

          <Typography id={`employee-desc-${employee.id}`} variant="body2" color="text.secondary" noWrap>
            {employee.role}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" mt="auto">
            <Chip size="small" label={employee.department} aria-label={`Department: ${employee.department}`} />
            <Chip size="small" label={employee.status} color={statusColor(employee.status)} variant="filled" aria-label={`Status: ${employee.status}`} />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default memo(EmployeeCard);
