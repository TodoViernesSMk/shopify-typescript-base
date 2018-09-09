import * as React from "react";
import { AppliedFilter, Badge, Caption, Card, Filter, FilterType, FormLayout, Heading, Layout, Link, Modal, Page, Pagination, ResourceList, ResourceListSelectedItems, SkeletonBodyText, Stack, TextContainer, TextStyle } from "@shopify/polaris";

import { OrderSchema } from "../../../shared/ts/shcema";
import { resource } from "../resource";
import * as util from "../util";

export class OrdersView extends React.Component<OrdersView.Props, OrdersView.State> {
  private meta: OrdersView.Meta = {
    title: "Orders",
    filters: []
  };

  public state: OrdersView.State = {
    item: OrderSchema.empty(),
    items: [],
    selectedItems: [],
    loadingView: false,
    modalOpen: false,
    searchValue: "",
    appliedFilters: [],
    hasPaginationPrev: false,
    hasPaginationNext: false,
    currentPaginationPage: 0,
    firstPaginationPage: 0,
    lastPaginationPage: 0,
  };

  public async componentDidMount (): Promise<void> {
    Promise.resolve()
      .then(() => this.setState({ loadingView: true }))
      .then(() => resource.shopify.handler({ method: "GET", path: "/admin/orders.json?status=any" }))
      .then((response) => this.setState({ items: OrderSchema.parse(response.data.orders) }))
      .then(() => this.setState({ loadingView: false }))
      .catch((error) => console.log("error", error))
  }

  public render (): JSX.Element {
    return (
      <Page
        title={this.meta.title}
        secondaryActions={[{
          content: "Templates",
          url: "templates",
        },{
          content: "Settings",
          url: "/shopify/settings",
        }]}
      >
        {this.state.loadingView ? this.skeleton() : this.content()}
        {this.modalOrderPreview()}
      </Page>
    );
  }

  private content (): JSX.Element {
    const resourceName = {
      singular: "order",
      plural: "orders",
    };

    return (
      <Card>
        <ResourceList
          resourceName={resourceName}
          items={this.filter(this.state.items)}
          filterControl={this.resourceFilterControl()}
          renderItem={(item) => this.resourceListItem(item)}
          selectedItems={this.state.selectedItems}
          onSelectionChange={(selectedItems) => this.setState({ selectedItems: selectedItems})}
          promotedBulkActions={[{
            content: "Prepare Orders",
            url: "/shopify/orders/prepare"
          }]}
        />
        {this.pagination()}
      </Card>
    )
  }

  private filter (items: OrderSchema.Object[]): OrderSchema.Object[] {
    return items.filter(item => {
      let matches = true;
      if(this.state.searchValue) {
        matches = Boolean(item.name.toLowerCase().match(this.state.searchValue.toLowerCase()))
      }
      return matches;
    });
  }

  private skeleton (): JSX.Element {
    return (
      <Card sectioned>
        <TextContainer>
          <SkeletonBodyText />
        </TextContainer>
      </Card>
    );
  }

  private resourceFilterControl (): JSX.Element {
    return (
      <ResourceList.FilterControl
        filters={this.meta.filters}
        appliedFilters={this.state.appliedFilters}
        onFiltersChange={(appliedFilters) => this.setState({ appliedFilters: appliedFilters })}
        searchValue={this.state.searchValue}
        onSearchChange={(searchValue) => this.setState({ searchValue: searchValue })}
        additionalAction={{ content: "Search" }}
      />
    );
  }

  private resourceListItem (order: OrderSchema.Object): JSX.Element {
    // order.email = "brod@gmail.com"
    return (
      <ResourceList.Item
        accessibilityLabel={`View order details`}
        id={order.id}
        shortcutActions={[{
          content: "View Preview",
          onAction: () => this.setState({ item: order, modalOpen: true })
        }]}
        onClick={() => this.setState({ item: order, modalOpen: true })}
        >
          <div style={{ display: "flex", alignItems: "start" }}>
            <div>
              <TextStyle variation="strong">{order.name}</TextStyle>
            </div>
            <div style={{ width: "25%", paddingLeft: "20px", textAlign: order.email ? "left" : "center", textOverflow: "truncate" }}>
              <TextStyle variation="subdued">{order.email || <span>&#8212;</span>}</TextStyle>
            </div>
            <div style={{ width: "20%" }}>
              <TextStyle variation="subdued">{util.formatDate(order.created_at)}</TextStyle>
            </div>
            <div style={{ width: "10%", textTransform: "capitalize" }}>
              <Badge status={order.financial_status === "paid" ? "info" : "warning" }>
                {order.financial_status}
              </Badge>
            </div>
            <div style={{ width: "10%", textTransform: "capitalize" }}>
              <Badge status={order.fulfillment_status === "fulfilled" ? "success" : "attention" }>
                {order.fulfillment_status || "unfulfilled" }
              </Badge>
            </div>
          </div>
      </ResourceList.Item>
    );
  }

  private modalOrderPreview (): JSX.Element {
    return (
      <Modal
        open={this.state.modalOpen}
        onClose={() => this.setState({ modalOpen: false })}
        title={<TextStyle variation="strong">Order Preview</TextStyle>}
      >
        <Modal.Section>
          <TextContainer>
            <pre style={{
              border: "1px solid #dfe4e8",
              borderRadius: "3px",
              padding: "10px",
              backgroundColor: "rgba(223, 227, 232, .3)"
            }}>
              {JSON.stringify(this.state.item, null, 2)}
            </pre>
          </TextContainer>
        </Modal.Section>
      </Modal>
    );
  }

  private pagination (): JSX.Element {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        borderTop: "1px solid #dfe4e8",
      }}>
        <Pagination
          hasPrevious={this.state.hasPaginationPrev}
          onPrevious={() => this.handlePaginationPrev()}
          hasNext={this.state.hasPaginationNext}
          onNext={() => this.handlePaginationNext()}
        />
      </div>
    );
  }

  private handlePaginationPrev (): void {
    this.handlePaginationGeneric(-1);
  }

  private handlePaginationNext (): void {
    this.handlePaginationGeneric(+1);
  }

  private handlePaginationGeneric (direction: number): void {
    this.setState((prevState) => {
      const currentPaginationPage = prevState.currentPaginationPage + direction;
      const hasPaginationPrev = currentPaginationPage > prevState.firstPaginationPage;
      const hasPaginationNext = currentPaginationPage < prevState.lastPaginationPage;
      return {
        ...prevState,
        currentPaginationPage,
        hasPaginationPrev,
        hasPaginationNext,
      }
    });
  }

}

export namespace OrdersView {
  export type OrderTypes = "info"|"success"|"error";
  export interface Meta {
    title: string;
    filters: Filter[];
  }
  export interface State {
    item: OrderSchema.Object;
    items: OrderSchema.Object[];
    selectedItems: ResourceListSelectedItems;
    loadingView: boolean;
    modalOpen: boolean;
    searchValue: string;
    appliedFilters: AppliedFilter[];
    hasPaginationPrev: boolean;
    hasPaginationNext: boolean;
    currentPaginationPage: number;
    firstPaginationPage: number;
    lastPaginationPage: number;
  }
  export interface Props {}
}
