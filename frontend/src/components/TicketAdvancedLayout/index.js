import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

const TicketAdvancedLayout = styled(Paper)({
    height: `calc(100% - 48px)`,
    maxHeight: '100%',
    display: "grid",
    gridTemplateRows: "auto 1fr",
    overflow: 'hidden'
})

export default TicketAdvancedLayout;