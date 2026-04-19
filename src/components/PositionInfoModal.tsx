import { useRef } from "react";
import {
  Box,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Draggable from "react-draggable";

import { PositionOrder } from "../types/client/order";
import { formatServerDate } from "../utils/date";
import { formatBigNumber } from "../utils/number";

type Props = {
  order: PositionOrder;
  initialX?: number;
  initialY?: number;
  onClose: () => void;
};

type NoteEntry =
  | string
  | number
  | boolean
  | { [key: string]: string | number | boolean };

function renderNoteEntry(note: NoteEntry, idx: number) {
  if (
    typeof note === "string" ||
    typeof note === "number" ||
    typeof note === "boolean"
  ) {
    return (
      <Chip
        key={idx}
        label={String(note)}
        size="small"
        variant="outlined"
        sx={{
          fontSize: 11,
          height: "auto",
          "& .MuiChip-label": { whiteSpace: "normal", wordBreak: "break-word" },
        }}
      />
    );
  }
  const entries = Object.entries(note);
  if (entries.length === 1) {
    const [key, val] = entries[0];
    return (
      <Chip
        key={idx}
        label={`${key}: ${String(val)}`}
        size="small"
        variant="outlined"
        sx={{
          fontSize: 11,
          height: "auto",
          "& .MuiChip-label": { whiteSpace: "normal", wordBreak: "break-word" },
        }}
      />
    );
  }
  return (
    <Paper key={idx} variant="outlined" sx={{ px: 1, py: 0.5, width: "100%" }}>
      {entries.map(([key, val]) => (
        <Typography key={key} variant="caption" component="div">
          <b>{key}:</b> {String(val)}
        </Typography>
      ))}
    </Paper>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <TableRow sx={{ "& td": { border: 0, py: 0.25, px: 0.5 } }}>
      <TableCell
        sx={{ color: "text.secondary", whiteSpace: "nowrap", fontSize: 12 }}
      >
        {label}
      </TableCell>
      <TableCell sx={{ fontWeight: 500, fontSize: 12, wordBreak: "break-all" }}>
        {value}
      </TableCell>
    </TableRow>
  );
}

export function PositionInfoModal({
  order,
  initialX = 80,
  initialY = 80,
  onClose,
}: Props) {
  const nodeRef = useRef<HTMLDivElement>(null);

  const side = order.qty > 0 ? "Buy" : "Sell";
  const price = order.price || order.stop_price || 0;
  const amount = Math.abs(order.qty) * price;
  const isBuy = order.qty > 0;

  const notes = order.notes as NoteEntry[] | undefined;

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".position-info-modal-handle"
      defaultPosition={{ x: initialX, y: initialY }}
      cancel=".MuiDialogContent-root, .MuiIconButton-root"
    >
      <Paper
        ref={nodeRef}
        elevation={8}
        sx={{
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 9999,
          minWidth: 300,
          maxWidth: 600,
          overflow: "hidden",
          userSelect: "none",
        }}
      >
        {/* Drag handle / header */}
        <Stack
          direction="row"
          className="position-info-modal-handle"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            px: 1.5,
            py: 0.75,
            bgcolor: isBuy ? "success.dark" : "error.dark",
            cursor: "grab",
            "&:active": { cursor: "grabbing" },
          }}
        >
          <Stack direction="row" sx={{ alignItems: "baseline", gap: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{ color: "#fff", fontWeight: 700 }}
            >
              {side}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.85)" }}
            >
              {order.order_type}
            </Typography>
          </Stack>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: "#fff", p: 0.25 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Box sx={{ px: 1, py: 0.75 }}>
          {/* Order info table */}
          <Table size="small" sx={{ tableLayout: "auto" }}>
            <TableBody>
              <InfoRow label="Price" value={price} />
              {order.stop_price && order.stop_price !== order.price && (
                <InfoRow label="Stop price" value={order.stop_price} />
              )}
              <InfoRow
                label="Qty"
                value={formatBigNumber(Math.abs(order.qty), "")}
              />
              {order.qty_filled !== undefined && (
                <InfoRow
                  label="Qty filled"
                  value={formatBigNumber(order.qty_filled, "")}
                />
              )}
              <InfoRow
                label="Amount"
                value={`${formatBigNumber(amount, "")} $`}
              />
              {order.status && <InfoRow label="Status" value={order.status} />}
              {order.update_at && (
                <InfoRow
                  label="Time"
                  value={formatServerDate(order.update_at)}
                />
              )}
              {order.original_id && (
                <InfoRow label="Order ID" value={String(order.original_id)} />
              )}
              {order.client_id && (
                <InfoRow label="Client ID" value={String(order.client_id)} />
              )}
            </TableBody>
          </Table>

          {/* Notes / context */}
          {notes && notes.length > 0 && (
            <>
              <Divider sx={{ my: 0.75 }} />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: "text.secondary",
                  display: "block",
                  mb: 0.5,
                  px: 0.5,
                }}
              >
                Notes
              </Typography>
              <Stack
                direction="row"
                sx={{ flexWrap: "wrap", gap: 0.5, px: 0.5 }}
              >
                {notes.map((note, idx) => renderNoteEntry(note, idx))}
              </Stack>
            </>
          )}
        </Box>
      </Paper>
    </Draggable>
  );
}
