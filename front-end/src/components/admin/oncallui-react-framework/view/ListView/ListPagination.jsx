import React from "react";

class ListPagination extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            prevY: 200
        }
    }
    handleObserver(entities, observer) {
        const y = entities[0].boundingClientRect.y;
        if (this.state.prevY && this.state.prevY > y) {
            //let page = this.props.page+1;
            let args = {
                pageSize: this.props.pageSize,
                page : this.props.page + 1,
                sorted: this.props.sorted,
                filtered: this.props.filtered
            }
            this.props.onFetchData(args);
            //   const lastPhoto = this.state.photos[this.state.photos.length - 1];
            //   const curPage = lastPhoto.albumId;
            //   this.getPhotos(curPage);
            //   this.setState({ page: curPage });
        }
        this.setState({ prevY: y });
    }
    componentDidMount() {
        let options = {
            root: null,
            rootMargin: "0px",
            threshold: 1.0
        };
        this.observer = new IntersectionObserver(
            this.handleObserver.bind(this),
            options
        );
        this.observer.observe(this.loadingRef);
    }
    render() {
        return (
            <React.Fragment>
                <div className="container">
        <div style={{ minHeight: "300px" }}>
          {/* {this.props.data.map(user => (
            <div>{user.name}</div>
          ))} */}
        </div>
        <div
          ref={loadingRef => (this.loadingRef = loadingRef)}
          
        >
        </div>
      </div>
            </React.Fragment>
        )
    }
}

export default ListPagination;