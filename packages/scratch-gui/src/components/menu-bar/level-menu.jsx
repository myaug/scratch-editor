import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {connect} from 'react-redux';

import check from './check.svg';
import {MenuItem, Submenu} from '../menu/menu.jsx';
import languageIcon from '../language-selector/language-icon.svg'; // Reuse language icon for now
import {levelMenuOpen, openLevelMenu} from '../../reducers/menus.js';
import {setLevel} from '../../reducers/block-level.js';

import styles from './settings-menu.css';

import dropdownCaret from './dropdown-caret.svg';

class LevelMenu extends React.PureComponent {
    constructor (props) {
        super(props);
        bindAll(this, [
            'setRef',
            'handleMouseOver'
        ]);
    }

    componentDidUpdate (prevProps) {
        // If the submenu has been toggled open, try scrolling the selected option into view.
        if (!prevProps.menuOpen && this.props.menuOpen && this.selectedRef) {
            this.selectedRef.scrollIntoView({block: 'center'});
        }
    }

    setRef (component) {
        this.selectedRef = component;
    }

    handleMouseOver () {
        // If we are using hover rather than clicks for submenus, scroll the selected option into view
        if (!this.props.menuOpen && this.selectedRef) {
            this.selectedRef.scrollIntoView({block: 'center'});
        }
    }

    render () {
        return (
            <MenuItem
                expanded={this.props.menuOpen}
            >
                <div
                    className={styles.option}
                    onClick={this.props.onRequestOpen}
                    onMouseOver={this.handleMouseOver}
                >
                    <img
                        className={styles.icon}
                        src={languageIcon}
                    />
                    <span className={styles.submenuLabel}>
                        <FormattedMessage
                            defaultMessage="Level"
                            description="Level sub-menu"
                            id="gui.menuBar.level"
                        />
                    </span>
                    <img
                        className={styles.expandCaret}
                        src={dropdownCaret}
                    />
                </div>
                <Submenu
                    className={styles.languageSubmenu}
                    place={this.props.isRtl ? 'left' : 'right'}
                >
                    <MenuItem
                        className={styles.languageMenuItem}
                        onClick={() => this.props.onChangeLevel('explorer')}
                    >
                        <img
                            className={classNames(styles.check, {
                                [styles.selected]: this.props.currentLevel === 'explorer'
                            })}
                            src={check}
                            {...(this.props.currentLevel === 'explorer' && {ref: this.setRef})}
                        />
                        <FormattedMessage
                            defaultMessage="Explorer"
                            description="Level explorer name"
                            id="gui.menuBar.levelExplorer"
                        />
                    </MenuItem>
                    <MenuItem
                        className={styles.languageMenuItem}
                        onClick={() => this.props.onChangeLevel('creator')}
                    >
                        <img
                            className={classNames(styles.check, {
                                [styles.selected]: this.props.currentLevel === 'creator'
                            })}
                            src={check}
                            {...(this.props.currentLevel === 'creator' && {ref: this.setRef})}
                        />
                        <FormattedMessage
                            defaultMessage="Creator"
                            description="Level creator name"
                            id="gui.menuBar.levelCreator"
                        />
                    </MenuItem>
                    <MenuItem
                        className={styles.languageMenuItem}
                        onClick={() => this.props.onChangeLevel('master')}
                    >
                        <img
                            className={classNames(styles.check, {
                                [styles.selected]: this.props.currentLevel === 'master'
                            })}
                            src={check}
                            {...(this.props.currentLevel === 'master' && {ref: this.setRef})}
                        />
                        <FormattedMessage
                            defaultMessage="Master"
                            description="Level master name"
                            id="gui.menuBar.levelMaster"
                        />
                    </MenuItem>
                    <MenuItem
                        className={styles.languageMenuItem}
                        onClick={() => this.props.onChangeLevel('studio')}
                    >
                        <img
                            className={classNames(styles.check, {
                                [styles.selected]: this.props.currentLevel === 'studio'
                            })}
                            src={check}
                            {...(this.props.currentLevel === 'studio' && {ref: this.setRef})}
                        />
                        <FormattedMessage
                            defaultMessage="Studio"
                            description="Level studio name"
                            id="gui.menuBar.levelStudio"
                        />
                    </MenuItem>
                </Submenu>
            </MenuItem>
        );
    }
}

LevelMenu.propTypes = {
    currentLevel: PropTypes.string,
    isRtl: PropTypes.bool,
    menuOpen: PropTypes.bool,
    onChangeLevel: PropTypes.func,
    onRequestCloseSettings: PropTypes.func,
    onRequestOpen: PropTypes.func
};

const mapStateToProps = state => ({
    currentLevel: state.scratchGui.blockLevel.level,
    isRtl: state.locales.isRtl,
    menuOpen: levelMenuOpen(state)
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    onChangeLevel: level => {
        dispatch(setLevel(level));
        ownProps.onRequestCloseSettings();
    },
    onRequestOpen: () => dispatch(openLevelMenu())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LevelMenu);
