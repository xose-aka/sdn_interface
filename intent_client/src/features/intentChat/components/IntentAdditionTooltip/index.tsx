import './index.scss'

interface IntentAdditionTooltipProps {
    message: string
    isIntentAdditionTooltipOpen: boolean
}

export default function IntentAdditionTooltip({message, isIntentAdditionTooltipOpen}: IntentAdditionTooltipProps) {
    return (
        <div className="intent-addition-tooltip border"
             style={{
                 opacity: !isIntentAdditionTooltipOpen ? "0" : "1",
                 visibility: !isIntentAdditionTooltipOpen ? "hidden" : "visible",
             }}>
            {message}
        </div>
    )
}