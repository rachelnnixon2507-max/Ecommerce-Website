using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Each ALTER TABLE is guarded with IF NOT EXISTS so this migration is
            // safe to apply to a database that already has some (or all) of these
            // columns — e.g. if the app was deployed with EnsureCreated() first,
            // or if a previous partial migration run left the schema in a mixed state.
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[Orders]') AND name = N'CancellationReason')
                    ALTER TABLE [Orders] ADD [CancellationReason] nvarchar(max) NULL;

                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[Orders]') AND name = N'Carrier')
                    ALTER TABLE [Orders] ADD [Carrier] nvarchar(max) NULL;

                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[Orders]') AND name = N'EstimatedDeliveryDate')
                    ALTER TABLE [Orders] ADD [EstimatedDeliveryDate] datetime2 NULL;

                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[Orders]') AND name = N'Notes')
                    ALTER TABLE [Orders] ADD [Notes] nvarchar(max) NULL;

                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[Orders]') AND name = N'PaymentStatus')
                    ALTER TABLE [Orders] ADD [PaymentStatus] nvarchar(max) NULL;

                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[Orders]') AND name = N'ShippingAddress')
                    ALTER TABLE [Orders] ADD [ShippingAddress] nvarchar(max) NOT NULL DEFAULT '';

                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[Orders]') AND name = N'TrackingNumber')
                    ALTER TABLE [Orders] ADD [TrackingNumber] nvarchar(max) NULL;

                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[Orders]') AND name = N'TransactionId')
                    ALTER TABLE [Orders] ADD [TransactionId] nvarchar(max) NULL;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CancellationReason",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Carrier",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "EstimatedDeliveryDate",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PaymentStatus",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ShippingAddress",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "TrackingNumber",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "TransactionId",
                table: "Orders");
        }
    }
}
