import React from 'react';
import './MealMenu.css';

const MealMenu = ({ menuItems }) => {
    return (
        <div className="meal-menu-container">
            <h2>Meal Menu</h2>
            <table>
                <thead>
                    <tr>
                        <th>Menu Items</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{menuItems.join(', ')}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default MealMenu;
