import React, { Fragment, useEffect } from 'react';
import { List, ListItem, Toggle, BlockTitle, Navbar, NavRight, Link, Page } from 'framework7-react';
import { SearchController, SearchView, SearchSettingsView } from '../../../../common/mobile/lib/controller/Search';
import { f7 } from 'framework7-react';
import { withTranslation } from 'react-i18next';
import { Dom7 } from 'framework7';
import { Device } from '../../../../common/mobile/utils/device';

class SearchSettings extends SearchSettingsView {
    constructor(props) {
        super(props);

        this.onToggleMarkResults = this.onToggleMarkResults.bind(this);
    }

    onToggleMarkResults(checked) {
        const api = Common.EditorApi.get();
        api.asc_selectSearchingResults(checked);
    }

    extraSearchOptions() {
        const anc_markup = super.extraSearchOptions();
        const show_popover = !Device.phone;
        const { t } = this.props;
        const _t = t("View.Settings", { returnObjects: true });

        const markup = (
            <Page>
                <Navbar title={_t.textFindAndReplace}>
                    {!show_popover &&
                        <NavRight>
                            <Link popupClose=".search-settings-popup">{_t.textDone}</Link>
                        </NavRight>
                    }
                </Navbar>
                <List>
                    <ListItem radio title={_t.textFind} name="find-replace-checkbox" checked={!this.state.useReplace} onClick={e => this.onFindReplaceClick('find')} />
                    <ListItem radio title={_t.textFindAndReplace} name="find-replace-checkbox" checked={this.state.useReplace} onClick={e => this.onFindReplaceClick('replace')} />
                    <ListItem radio title={_t.textFindAndReplaceAll} name="find-replace-checkbox" checked={this.state.isReplaceAll}
                        onClick={() => this.onFindReplaceClick('replace-all')}></ListItem>
                </List>
                <BlockTitle>{_t.textSearchIn}</BlockTitle>
                <List>
                    <ListItem radio title={_t.textWorkbook} name="search-in-checkbox" value="0" checked={this.state.searchIn === 0} onClick={() => this.setState({
                        searchIn: 0
                    })} />
                    <ListItem radio title={_t.textSheet} name="search-in-checkbox" value="1" checked={this.state.searchIn === 1} onClick={( )=> this.setState({
                        searchIn: 1
                    })} />
                </List>
                <BlockTitle>{_t.textSearchBy}</BlockTitle>
                <List>
                    <ListItem radio title={_t.textByRows} name="search-by-checkbox" value="0" checked={this.state.searchBy === 0} onClick={() => this.setState({
                        searchBy: 0
                    })} />
                    <ListItem radio title={_t.textByColumns} name="search-by-checkbox" value="1" checked={this.state.searchBy === 1} onClick={() => this.setState({
                        searchBy: 1
                    })} />
                </List>
                <BlockTitle>{_t.textLookIn}</BlockTitle>
                <List>
                    <ListItem radio title={_t.textFormulas} name="look-in-checkbox" value="0" checked={this.state.lookIn === 0} onClick={() => this.setState({
                        lookIn: 0
                    })} />
                    <ListItem radio title={_t.textValues} name="look-in-checkbox" value="1" checked={this.state.lookIn === 1} onClick={() => this.setState({
                        lookIn: 1
                    })} />
                </List>
                <List>
                    <ListItem title={_t.textMatchCase}>
                        <Toggle slot="after" className="toggle-match-case" checked={this.state.isMatchCase} onToggleChange={() => this.setState({
                            isMatchCase: !this.state.isMatchCase
                        })} />
                    </ListItem>
                    <ListItem title={_t.textMatchCell}>
                        <Toggle slot="after" className="toggle-match-cell" checked={this.state.isMatchCell} onToggleChange={() => this.setState({
                            isMatchCell: !this.state.isMatchCell
                        })} />
                    </ListItem>
                    <ListItem title={_t.textHighlightRes}>
                        <Toggle slot="after" className="toggle-mark-results" defaultChecked onToggleChange={this.onToggleMarkResults} />
                    </ListItem>
                </List>
            </Page>
        )

        return {...anc_markup, ...markup};
    }
}

class SESearchView extends SearchView {
    constructor(props) {
        super(props);
    }

    searchParams() {
        let params = super.searchParams();
        const $$ = Dom7;

        const checkboxMatchCase = f7.toggle.get('.toggle-match-case'),
            checkboxMatchCell = f7.toggle.get('.toggle-match-cell'),
            checkboxMarkResults = f7.toggle.get('.toggle-mark-results'),
            checkboxSearchIn = $$('[name="search-in-checkbox"]:checked')[0],
            checkboxSearchBy = $$('[name="search-by-checkbox"]:checked')[0],
            checkboxLookIn = $$('[name="look-in-checkbox"]:checked')[0];

        const searchOptions = {
            caseSensitive: checkboxMatchCase.checked,
            highlight: checkboxMarkResults.checked,
            matchCell: checkboxMatchCell.checked,
            searchIn: checkboxSearchIn.value,
            searchBy: checkboxSearchBy.value,
            lookIn: checkboxLookIn.value,
        };

        return {...params, ...searchOptions};
    }

    onSearchbarShow(isshowed, bar) {
        super.onSearchbarShow(isshowed, bar);

        const api = Common.EditorApi.get();
        if ( isshowed ) {
            const checkboxMarkResults = f7.toggle.get('.toggle-mark-results');
            api.asc_selectSearchingResults(checkboxMarkResults.checked);
        } else api.asc_selectSearchingResults(false);
    }
}

const Search = withTranslation()(props => {
    const { t } = props;
    const _t = t('View.Settings', {returnObjects: true});

    const onSearchQuery = params => {
        const api = Common.EditorApi.get();
      
        let lookIn = +params.lookIn === 0;
        let searchIn = +params.searchIn === 1;
        let searchBy = +params.searchBy === 0;

        if (params.find && params.find.length) {
            let options = new Asc.asc_CFindOptions();
    
            options.asc_setFindWhat(params.find);
            options.asc_setScanForward(params.forward);
            options.asc_setIsMatchCase(params.caseSensitive);
            options.asc_setIsWholeCell(params.matchCell);
            options.asc_setScanOnOnlySheet(searchIn);
            options.asc_setScanByRows(searchBy);
            options.asc_setLookIn(lookIn ? Asc.c_oAscFindLookIn.Formulas : Asc.c_oAscFindLookIn.Value);

            if (!api.asc_findText(options)) {
                f7.dialog.alert(null, _t.textNoTextFound);
            }
        }
    };

    const onReplaceQuery = params => {
        const api = Common.EditorApi.get();
        let lookIn = +params.lookIn === 0;
        let searchIn = +params.searchIn === 1;
        let searchBy = +params.searchBy === 0;

        if (params.find && params.find.length) {
            api.isReplaceAll = false;

            let options = new Asc.asc_CFindOptions();

            options.asc_setFindWhat(params.find);
            options.asc_setReplaceWith(params.replace || '');
            options.asc_setIsMatchCase(params.caseSensitive);
            options.asc_setIsWholeCell(params.matchCell);
            options.asc_setScanOnOnlySheet(searchIn);
            options.asc_setScanByRows(searchBy);
            options.asc_setLookIn(lookIn ? Asc.c_oAscFindLookIn.Formulas : Asc.c_oAscFindLookIn.Value);
            options.asc_setIsReplaceAll(false);

            api.asc_replaceText(options);
        }
    }

    const onReplaceAllQuery = params => {
        const api = Common.EditorApi.get();
        let lookIn = +params.lookIn === 0;
        let searchIn = +params.searchIn === 1;
        let searchBy = +params.searchBy === 0;

        if (params.find && params.find.length) {
            api.isReplaceAll = true;

            let options = new Asc.asc_CFindOptions();

            options.asc_setFindWhat(params.find);
            options.asc_setReplaceWith(params.replace || '');
            options.asc_setIsMatchCase(params.caseSensitive);
            options.asc_setIsWholeCell(params.matchCell);
            options.asc_setScanOnOnlySheet(searchIn);
            options.asc_setScanByRows(searchBy);
            options.asc_setLookIn(lookIn ? Asc.c_oAscFindLookIn.Formulas : Asc.c_oAscFindLookIn.Value);
            options.asc_setIsReplaceAll(true);

            api.asc_replaceText(options);
        }
    }

    return <SESearchView _t={_t} onSearchQuery={onSearchQuery} onReplaceQuery={onReplaceQuery} onReplaceAllQuery={onReplaceAllQuery} />
});

const SearchSettingsWithTranslation = withTranslation()(SearchSettings);

export {Search, SearchSettingsWithTranslation as SearchSettings}