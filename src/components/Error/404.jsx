﻿import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './Error.css';

export default class NotFound extends Component {
    render() {
        return <>
            <div id="notfound">
                <div className="notfound">
                    <div className="notfound-404">
                        <h1>Oops!</h1>
                    </div>
                    <br />
                    <br />
                    <h2>404 - Page not found</h2>
                    <p>The page you are looking for might have been removed had its name changed or is temporarily unavailable.</p>
                    <Link to="/models">Go To Homepage</Link>
                </div>
            </div>
        </>
    }
}