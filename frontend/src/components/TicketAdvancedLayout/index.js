import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

const TicketAdvancedLayout = styled(Paper)({
    height: `calc(100% - 48px)`,
    maxHeight: '100%',
    minHeight: 0,
    display: "grid",
    gridTemplateRows: "auto 1fr",
    overflow: 'hidden',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
})

export default TicketAdvancedLayout;