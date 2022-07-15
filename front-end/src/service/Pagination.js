import React from "react";
import PropTypes from "prop-types";

const defaultButton = props => <button {...props}>{props.children}</button>;

export default class Pagination extends React.Component {
  constructor(props) {
    super();

    this.changePage = this.changePage.bind(this);

    this.state = {
      visiblePages: this.getVisiblePages(null, props.pages)
    };
  }

  static propTypes = {
    pages: PropTypes.number,
    page: PropTypes.number,
    PageButtonComponent: PropTypes.any,
    onPageChange: PropTypes.func,
    previousText: PropTypes.object,
    nextText: PropTypes.object
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.pages !== nextProps.pages) {
      this.setState({
        visiblePages: this.getVisiblePages(null, nextProps.pages)
      });
    }

    this.changePage(nextProps.page + 1);
  }

  filterPages = (visiblePages, totalPages) => {
    return visiblePages.filter(page => page <= totalPages);
  };

  getVisiblePages = (page, total) => {
    if (total < 7) {
      return this.filterPages([1, 2, 3, 4, 5, 6], total);
    } else {
      if (page % 5 >= 0 && page > 4 && page + 2 < total) {
        return [1, page - 1, page, page + 1, total];
      } else if (page % 5 >= 0 && page > 4 && page + 2 >= total) {
        return [1, total - 3, total - 2, total - 1, total];
      } else {
        return [1, 2, 3, 4, 5, total];
      }
    }
  };

  changePage = (page) => {
    const activePage = this.props.page + 1;

    if (page === activePage) {
      return;
    }

    const visiblePages = this.getVisiblePages(page, this.props.pages);

    this.setState({
      visiblePages: this.filterPages(visiblePages, this.props.pages)
    });

    this.props.onPageChange(page - 1);
  }

  render() {
    const { PageButtonComponent = defaultButton } = this.props;
    const { visiblePages } = this.state;
    const activePage = this.props.page + 1;
    const pageSizeOptions =[10,20,50];
    const {
      showPageSizeOptions,
      pageSize,
      onPageSizeChange,
     /*  // Computed
      pages,
      // Props
      page,
      showPageSizeOptions,
      pageSizeOptions,
      pageSize,
      showPageJump,
      canPrevious,
      canNext,
      onPageSizeChange,
      className,
      PreviousComponent = defaultButton,
      NextComponent = defaultButton, */
    } = this.props

    return (
      <React.Fragment>
      <div className="Table__pagination " style={{paddingBottom:0}}>
        <div className="Table__prevPageWrapper">
          <PageButtonComponent
            className="Table__pageButton"
            onClick={(e) => {e.preventDefault();
              if (activePage === 1) return;
              this.changePage(activePage - 1);
            }}
            disabled={activePage === 1}
          >
            {this.props.previousText}
          </PageButtonComponent>
        </div>
        <div className="Table__visiblePagesWrapper">
          {visiblePages.map((page, index, array) => {
            return (
              <PageButtonComponent
                key={index}
                className={
                  activePage === page
                    ? "Table__pageButton Table__pageButton--active"
                    : "Table__pageButton"
                }
                onClick={(e) => {e.preventDefault(); this.changePage(page)}}
              >
                {array[index - 1] + 2 < page ? `...${page}` : page}
              </PageButtonComponent>
            );
          })}
        </div>
        <div className="Table__nextPageWrapper">
          <PageButtonComponent
            className="Table__pageButton"
            onClick={(e) => { e.preventDefault();
              if (activePage === this.props.pages) return;
              this.changePage(activePage + 1);
            }}
            disabled={activePage === this.props.pages}
          >
            {this.props.nextText}
          </PageButtonComponent>
        </div>

 {/*        {showPageSizeOptions && (
            <span className="select-wrap -pageSizeOptions">
              <select onChange={e => onPageSizeChange(Number(e.target.value))} value={pageSize}>
                {pageSizeOptions.map((option, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <option key={i} value={option}>
                    {option} {this.props.rowsText}
                  </option>
                ))}
              </select>
            </span>
          )} */}

      </div>
      {showPageSizeOptions && (
            <div className="view_by_"><span>View By:</span>
              <ul>
                {pageSizeOptions.map((option, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <li  onClick={e => {e.preventDefault(); onPageSizeChange(Number(option))}}  className={pageSize==option? 'active':''} key={i}>
                    {option} {/* this.props.rowsText */}
                  </li>
                ))}
              </ul>
            </div>
          )}
      </React.Fragment>
    );
  }
}
