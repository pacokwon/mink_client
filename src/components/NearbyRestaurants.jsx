import React, { Component, Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import {
    Card,
    Grid,
    Grow,
    Input,
    List,
    MenuItem,
    ListItemText,
    ListSubheader,
    Typography
} from '@material-ui/core';
import axios from 'axios';
import { dorms } from './subcomponents/store.js';
import RestaurantCard from './subcomponents/RestaurantCard.jsx';
import AuthHelperMethods from '../helpers/AuthHelperMethods';

const styles = theme => ({
    card: {
        marginTop: 20,
        marginLeft: 10,
        marginRight: 10,
        height: 660,
        overflow: 'scroll'
    },
    heading: {
        paddingTop: 20
    },
    distance: {
        textAlign: 'right'
    },
    title: {
        paddingTop: 20,
    }
})

class NearbyRestaurants extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dist_arr: null,
            closest_N: 3,
            selectedRestaurant: null
        }
    }

    componentDidMount() {
        /**
         * this.props.userdata 는 dormitory code를 담고 있다.
         * 이는 dorms object의 key이다. 이에 대응하는 값은 "한글이름 영어이름"이다.
         * 따라서 split으로 두 이름을 자르고 첫 번째 원소를 선택하면 한글이름을 얻게 된다.
         */
        const dormitory = '카이스트본원' + this.getDormName()

        axios('/api/restaurant/nearby', {
            method: 'GET',
            params: {
                start: dormitory,
                closest_N: 7
            }
        })
        .then(res => {
            const { cafeteria, ratings } = res.data[0].cafeteria_list[0];

            this.setState({
                dist_arr: res.data,
                selectedRestaurant: <RestaurantCard name={cafeteria} ratings={ratings} onCardClick={this.props.onCardClick} />,
                selectedRestaurantName: cafeteria
            })
        })
    }

    getDormName = () => {
        return dorms[this.props.userdata.dormitory].split(" ")[0];
    }

    handleCaftClick = (caft, ratings) => event => {
        this.setState({
            selectedRestaurantName: caft,
            selectedRestaurant: <RestaurantCard name={caft} ratings={ratings} onCardClick={this.props.onCardClick} />
        })
    }

    handleInputChange = event => {
        this.setState({closest_N: event.target.value});
    }

    render() {
        const { classes } = this.props;
        const { dist_arr, closest_N, selectedRestaurant, selectedRestaurantName } = this.state;

        if (dist_arr) {
            return (
                <Grid container spacing={2}>
                    <Grow in={dist_arr !== null}>
                        <Grid item xs={12} sm={6} md={6} lg={6}>
                            <Card className={classes.card}>
                                <div style={{textAlign: 'center'}}>
                                <Input
                                    type="Number"
                                    style={{width: 30}}
                                    inputProps={{min: 1, max: 7}}
                                    value={closest_N}
                                    onChange={this.handleInputChange}
                                />
                                <Typography
                                    variant="subtitle1"
                                    className={classes.title}
                                    display='inline'
                                >
                                    {`closest restaurants to ${this.getDormName()}`}
                                </Typography>
                                </div>
                                <List>
                                {dist_arr.map(({ _id, cafeteria_list }, idx) =>
                                    idx < closest_N
                                    ?
                                        <Fragment key={_id.destination}>
                                            <ListSubheader disableSticky={true}> {_id.destination} </ListSubheader>
                                            {cafeteria_list.map(({ cafeteria, ratings }, index) =>
                                                <MenuItem
                                                    key={cafeteria}
                                                    button
                                                    onClick={this.handleCaftClick(cafeteria, ratings)}
                                                    selected={selectedRestaurantName === cafeteria}
                                                >
                                                    <ListItemText primary={cafeteria}/>
                                                    {index === 0
                                                        ?
                                                        <ListItemText
                                                            disableTypography
                                                            className={classes.distance}
                                                            primary={
                                                                <Typography
                                                                    variant="caption"
                                                                    color="textSecondary"
                                                                >
                                                                    {`${_id.distance}m`}
                                                                </Typography>
                                                            }
                                                        />
                                                        :
                                                        null
                                                    }
                                                </MenuItem>
                                            )}
                                        </Fragment>
                                    :
                                        null
                                )}
                                </List>
                            </Card>
                            </Grid>
                    </Grow>
                        {selectedRestaurant
                        ?
                            <Grow in={selectedRestaurant !== null}>
                                <Grid item xs={12} sm={6} md={6} lg={6}>
                                    {selectedRestaurant}
                                </Grid>
                            </Grow>
                        :
                            null
                        }
                </Grid>
            );
        } else {
            return (
                null
            );
        }
    }
}

export default withStyles(styles)(NearbyRestaurants)
