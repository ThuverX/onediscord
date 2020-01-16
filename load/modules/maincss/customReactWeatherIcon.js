// From https://github.com/divyanshu013/react-animated-weather

const Skycons = require('./skycons.js')

module.exports = (React) => {
    class ReactAnimatedWeather extends React.Component {
        constructor(props) {
            super(props);
    
            this.skyconIcon = new Skycons({
                color: props.color
            });
        }
    
        componentDidMount() {
            const {
                icon,
                animate
            } = this.props;
            this.setIcon(icon, animate);
        }
    
        componentWillReceiveProps(nextProps) {
            // If props match, don't reinitialize the icon
            const {
                animate,
                icon
            } = this.props;
            if (
                this.skyconIcon.color === nextProps.color &&
                animate === nextProps.animate &&
                icon === nextProps.icon
            ) {
                return;
            }
    
            // Remove the old icon
            this.skyconIcon.remove(this.skycon);
    
            this.skyconIcon = new Skycons({
                color: nextProps.color
            });
    
            this.setIcon(nextProps.icon, nextProps.animate);
            this.forceUpdate();
        }
    
        setIcon(icon, animate) {
            this.skyconIcon.add(this.skycon, Skycons[icon]);
    
            if (animate) {
                this.skyconIcon.play();
            }
        }
    
        render() {
            const {
                size
            } = this.props;
            return React.createElement('canvas',{
                ref:(canvas) => {
                    this.skycon = canvas
                },
                width:size,
                height:size
            })
        }
    }

    return ReactAnimatedWeather
}