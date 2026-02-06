import React from "react";
import PropTypes from "prop-types";
import Skeleton from "@material-ui/lab/Skeleton";

/**
 * Skeleton de card para loading em views mobile (listas em formato card).
 * Use em vez de TableRowSkeleton quando o conteúdo está dentro de div, não tabela.
 */
const CardSkeleton = ({ variant = "default" }) => {
	const isChip = variant === "chip";

	return (
		<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
			<div className="flex items-center justify-between mb-2">
				<div className="flex items-center gap-2">
					{isChip ? (
						<Skeleton
							animation="wave"
							variant="rect"
							width={80}
							height={24}
							style={{ borderRadius: 4 }}
						/>
					) : (
						<>
							<Skeleton animation="wave" variant="rect" width={40} height={40} />
							<div>
								<Skeleton animation="wave" width={120} height={20} />
								<Skeleton animation="wave" width={60} height={16} />
							</div>
						</>
					)}
				</div>
				<div className="flex gap-1">
					<Skeleton animation="wave" variant="rect" width={32} height={32} />
					<Skeleton animation="wave" variant="rect" width={32} height={32} />
				</div>
			</div>
		</div>
	);
};

CardSkeleton.propTypes = {
	variant: PropTypes.oneOf(["default", "chip"]),
};

export default CardSkeleton;
