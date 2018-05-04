import React, {Component} from 'react';
import TotalPrice from './components/AgreementSummary.totalPrice';
import BusinessGroupList from './components/AgreementSummary.businessGroupList';
import FreeMonthsList from './components/AgreementSummary.freeMonthsList';


class AgreementSummaryMainView extends Component {

    constructor(props) {
        super(props);
        this.context = props;
    }
    render() {
        this.isLoaded = this.props.totalAgreementSummaryPriceData || this.props.totalAgreementSummaryGroupsData;
        return this.isLoaded && (
        <div id="salesAgreementSummary">
            { this.props.totalAgreementSummaryPriceData &&
            (<TotalPrice totalAgreementSummaryPriceData={this.props.totalAgreementSummaryPriceData} {...this.props} />)}
            <div className="container">
                <FreeMonthsList totalAgreementSummaryFreeMonthsData={this.props.totalAgreementSummaryFreeMonthsData} {...this.props} />
                { this.props.totalAgreementSummaryGroupsData &&
                (<BusinessGroupList totalAgreementSummaryGroupsData={this.props.totalAgreementSummaryGroupsData} {...this.props} />)}
            </div>
        </div>
            );
    }
    }

export default AgreementSummaryMainView;
