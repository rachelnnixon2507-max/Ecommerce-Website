-- Only insert if no categories exist
IF NOT EXISTS (SELECT 1 FROM Categories)
BEGIN
    SET IDENTITY_INSERT Categories ON;
    INSERT INTO Categories (Id, Name, ImageUrl) VALUES (1, 'Uncategorized', '');
    SET IDENTITY_INSERT Categories OFF;
END
