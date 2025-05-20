import { Trans } from "@lingui/macro";
import { Box, Card, CardContent, IconButton, Typography } from "@mui/material";
import { useState } from "react";
import * as Vaul from "vaul";

import { ElectricitySelectors } from "src/components/electricity-selectors";
import { useStyles } from "src/components/vaul/useStyles";
import { getLocalizedLabel } from "src/domain/translation";
import { Icon } from "src/icons";
import { useQueryStateSingle } from "src/lib/use-query-state";

const MobileControls = () => {
  const { classes } = useStyles();

  const [queryState] = useQueryStateSingle();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Extract current values with defaults
  const period = queryState.period || "2020";
  const priceComponent = queryState.priceComponent || "total";
  const category = queryState.category || "H4";
  const product = queryState.product || "standard";

  // Get localized labels for display
  const priceComponentLabel = getLocalizedLabel({ id: priceComponent });
  const categoryLabel = getLocalizedLabel({ id: category });
  const productLabel = getLocalizedLabel({ id: product });

  // Format the current status string
  const currentStatus = `${period}, ${priceComponentLabel}, ${categoryLabel}, ${productLabel}`;

  return (
    <>
      <Card
        elevation={2}
        sx={{
          position: "relative",
          width: "100%",
          mb: 2,
        }}
      >
        <CardContent sx={{ pb: "16px !important" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                <Trans id="selector.legend.select.parameters">
                  Parameter auswählen
                </Trans>
              </Typography>
              <Typography variant="body2">{currentStatus}</Typography>
            </Box>
            <IconButton
              onClick={() => setIsDrawerOpen(true)}
              edge="end"
              aria-label="edit parameters"
            >
              <Icon name="menu" />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      <Vaul.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Vaul.Portal>
          <Vaul.Overlay className={classes.overlay} />
          <Vaul.Content className={classes.content}>
            <div className={classes.handle} />
            <Box sx={{ overflowY: "auto", flex: 1 }}>
              <ElectricitySelectors />
            </Box>
          </Vaul.Content>
        </Vaul.Portal>
      </Vaul.Root>
    </>
  );
};

export default MobileControls;
