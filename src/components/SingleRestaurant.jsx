import React, { Component, Fragment } from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    CardMedia,
    Divider,
    Grid,
    Grow,
    List,
    ListItem,
    ListItemText,
    Switch,
    Typography
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import axios from 'axios';
import {
    Bar,
    BarChart,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import PacoRatings from './PacoRatings.jsx';
import RestaurantRateDialog from './RestaurantRateDialog.jsx'
import MenuRateDialog from './MenuRateDialog.jsx'

const styles = theme => ({
    card: {
        marginTop: 20,
        marginLeft: 10,
        marginRight: 10,
        [theme.breakpoints.up(1500 + theme.spacing.unit * 3 * 2)]: {
            width: 700,
            marginLeft: 'auto',
            marginRight: 'auto'
        },
    },
    description: {
        marginBottom: 20
    },
    divider: {
        marginTop: 10,
        marginBottom: 10
    },
    category: {
        marginTop: 10,
        marginBottom: 5
    },
    menus: {
        maxHeight: 450,
        overflow: 'scroll',
        marginTop: 10
    },
    grid: {
        marginRight: 5
    },
    media: {
        maxWidth: 400,
        marginLeft: 'auto',
        marginRight: 'auto'
    },
    constraint: {
        [theme.breakpoints.up(1500)]: {
            width: 654,
            marginLeft: 'auto',
            marginRight: 'auto'
        },
    },
    valign: {
        paddingTop: '2%'
    }
})

class SingleRestaurant extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
            rating: null,
            menu: ""
        }
    }

    componentDidMount() {
        const { name } = this.props;

        axios('/api/restaurant/single', {
            method: 'GET',
            params: {
                'name': name
            }
        })
        .then(res => {
            this.setState({
                data: res.data[0]
            })
        })

        axios('/api/rating/single', {
            method: 'GET',
            params: {
                'name': name
            }
        })
        .then(res => {
            this.setState({
                rating: res.data
            })
        })
    }

    setChartData = ratings => {
        const defaultValues = {
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
            '5': 0
        }

        const chartData = ratings.reduce((acc, cur) => {
            acc[0][cur.taste] += 1;
            acc[1][cur.portion] += 1;
            acc[2][cur.price] += 1;

            return acc;
        }, [
            {
                'name': 'taste',
                ...defaultValues
            },
            {
                'name': 'portion',
                ...defaultValues
            },
            {
                'name': 'price',
                ...defaultValues
            }
        ]);

        this.setState({
            chartData
        })
    }

    handleMenuClick = menu => event => {
        const { ratings } = this.state.rating[menu];
        this.setChartData(ratings);

        this.setState({
            menu
        })
    }

    handleRestaurantSend = rating => {
        const { name } = this.props;

        let data = Object.assign({}, this.state.data);
        data.rating.push(rating);
        this.setState({ data });

        axios.put('/api/rating/restaurant', {
            name,
            rating
        })
        .then(res => {
            console.log(res);
        })
    }

    handleMenuSend = starPointsObj => {
        const { name } = this.props;
        const { menu } = this.state;

        let rating = this.state.rating;
        console.log(rating[menu].ratings)
        rating[menu].ratings.push(starPointsObj);
        this.setChartData(rating[menu].ratings)

        this.setState({ rating })

        axios.put('/api/rating/menu', {
            name,
            menu,
            starPointsObj
        })
    }

    render() {
        const { classes } = this.props;
        const { data, menu, rating, chartData } = this.state;

        // https://learnui.design/tools/data-color-picker.html#palette
        const chartPalette = [
            [
                '#fb3a3a',
                '#fb6f00',
                '#e99e00',
                '#c6c800',
                '#8bee00'
            ],
            [
                '#003f5c',
                '#58508d',
                '#bc5090',
                '#ff6361',
                '#ffa600'
            ]
        ]

        const randomIndex = Math.floor(Math.random() * chartPalette.length)

        if (data && rating) {
            const { name, categories, description } = data;
            const avgRating = Math.round(data.rating.reduce((acc, cur, idx) => {
                acc += cur;
                return idx === data.rating.length - 1 ? acc / data.rating.length : acc;
            }) * 10) / 10;

            return (
                <Grid container spacing={16}>
                    <Grow in = {data !== null && rating != null}>
                        <Grid
                            item
                            xs={12} sm={6} md={6}
                            component={Card}
                        >
                            <CardHeader
                                title={name}
                                titleTypographyProps={{variant: 'title', align: 'center'}}
                            />
                            <CardMedia
                                title={name}
                                src={require('../resources/' + name + '.jpeg')}
                                component="img"
                                className={classes.media}
                            />
                            <CardContent>
                                <Typography
                                    component="p"
                                    variant="body2"
                                    align='center'
                                    className={classes.description}
                                >
                                    {description}
                                </Typography>
                                <PacoRatings starPoints={avgRating} />
                                <RestaurantRateDialog onSend={this.handleRestaurantSend}/>
                                <Divider className={classes.divider} />
                                <div className={classes.menus}>
                                    {categories.map(obj =>
                                        <Fragment key={obj.category}>
                                            <Typography
                                                variant="h6"
                                                color="secondary"
                                                className={classes.category}
                                            >
                                                {obj.category}
                                            </Typography>
                                            <List>
                                            {obj.menus.map(menu =>
                                                <ListItem
                                                    button
                                                    key={menu}
                                                    onClick={this.handleMenuClick(menu)}
                                                >
                                                    <ListItemText primary={menu} />
                                                </ListItem>
                                            )}
                                            </List>
                                        </Fragment>
                                    )}
                                </div>
                            </CardContent>
                        </Grid>
                    </Grow>
                    <Grow in={menu !== ""}>
                        <Grid
                            item
                            xs={12} sm={6} md={6}
                            component={Card}
                        >
                            <CardHeader
                                title={menu}
                                titleTypographyProps={{variant: 'title', align: 'center'}}
                            />
                            <CardMedia
                                title={menu}
                                src={require('../resources/chicken.jpeg')}
                                component="img"
                                className={classes.media}
                            />
                            <CardContent className={classes.content}>
                                <div style={{display: 'flex', justifyContent: 'space-between', width: '50%', marginLeft: 'auto', marginRight: 'auto'}}>
                                    <Typography
                                        variant="h6"
                                        className={classes.valign}
                                    >
                                        Menu Ratings
                                    </Typography>
                                    <Switch checked={true}/>
                                </div>
                                <div className={classes.constraint}>
                                    <ResponsiveContainer width='100%' aspect={2.4}>
                                        <BarChart layout={'vertical'} data={chartData}
                                        margin={{top: 20, right: 30, left: 20, bottom: 5}}>

                                            <YAxis dataKey="name" type="category"/>
                                            <XAxis type="number" />
                                            <Tooltip/>
                                            <Legend />
                                            {[1, 2, 3, 4, 5].map(e =>
                                                <Bar
                                                    key={e}
                                                    dataKey={e}
                                                    stackId="a"
                                                    fill={chartPalette[randomIndex][e - 1]}
                                                />
                                            )}
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <MenuRateDialog onSend={this.handleMenuSend} />
                            </CardContent>
                        </Grid>
                    </Grow>
                </Grid>
            );
        } else {
            return (
                null
            );
        }
    }
}

export default withStyles(styles)(SingleRestaurant);
